#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
============================================================================
 Script de Importación Masiva: Registro Mercantil de Cuba
============================================================================
 Descripción: Lee los archivos Excel de Cooperativas Agropecuarias y
              MIPYMES, y registra todos los registros mercantiles en la
              base de datos PostgreSQL del portal.

 Archivos de entrada:
   - Cooperativas Agropecuarias Enero 2026.xlsx
   - BASE DE DATOS MIPYMES REG.MERCANTIL JULIO 2025.xlsx

 Uso:
   python3 import_registros_mercantiles.py \
     --db-url "postgresql://user:pass@localhost:5432/registro_mercantil" \
     --cooperativas "/ruta/Cooperativas Agropecuarias Enero 2026.xlsx" \
     --mipymes "/ruta/BASE DE DATOS MIPYMES REG.MERCANTIL JULIO 2025.xlsx"

 Requisitos:
   pip install pandas openpyxl psycopg2-binary

 Notas:
   - Ejecutar migrate_searchable_names.sql ANTES de este script.
   - Usa INSERT ... ON CONFLICT DO NOTHING para evitar duplicados por NIRE.
   - Las modificaciones de MIPYMES se registran en la tabla Modification.
============================================================================
"""

import argparse
import logging
import os
import re
import sys
from datetime import datetime
from typing import Any, Optional

import pandas as pd

try:
    import psycopg2
    from psycopg2 import sql
    from psycopg2.extras import execute_values
except ImportError:
    print("ERROR: psycopg2-binary no está instalado.")
    print("  Ejecuta: pip install psycopg2-binary")
    sys.exit(1)

# ============================================================================
# CONFIGURACIÓN DE LOGGING
# ============================================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("/home/z/my-project/download/import_log.txt", mode="a", encoding="utf-8"),
    ],
)
log = logging.getLogger(__name__)

# ============================================================================
# MAPEO DE PROVINCIAS (DPA -> Nombre normalizado)
# ============================================================================
PROVINCE_DPA_MAP = {
    "21": "Pinar del Río",
    "22": "Artemisa",
    "23": "La Habana",
    "24": "Mayabeque",
    "25": "Matanzas",
    "26": "Villa Clara",
    "27": "Cienfuegos",
    "28": "Sancti Spíritus",
    "29": "Ciego de Ávila",
    "30": "Camagüey",
    "31": "Las Tunas",
    "32": "Holguín",
    "33": "Granma",
    "34": "Santiago de Cuba",
    "35": "Guantánamo",
    "40": "Isla de la Juventud",
}

# Mapeo inverso: nombre de hoja del MIPYMES -> código DPA de provincia
MIPYMES_SHEET_TO_DPA = {
    "PINAR R.":      "21",
    "ARTEMISA":      "22",
    "LA HABANA":     "23",
    "MAYABEQUE":     "24",
    "MATANZAS":      "25",
    "VILLA CLARA":   "26",
    "CIENFUEGOS":    "27",
    "SANCTI SP.":    "28",
    "CIEGO A":       "29",
    "CAMAG":         "30",
    "LAS TUNAS":     "31",
    "HOLGUIN":       "32",
    "GRANMA":        "33",
    "SANTIAGO C":    "34",
    "GUANTANAMO":    "35",
    "ISLA J":        "40",
    "MARIEL":        "22",  # ZED Mariel pertenece a Artemisa
}

# ============================================================================
# LIMPIEZA DE TEXTO
# ============================================================================
def clean_text(val: Any) -> Optional[str]:
    """Limpia un valor de texto: elimina espacios extra, NaN, etc."""
    if val is None or pd.isna(val):
        return None
    s = str(val).strip()
    if s.lower() in ("nan", "none", "", "nat"):
        return None
    return s


def clean_int(val: Any) -> Optional[int]:
    """Convierte un valor a entero de forma segura."""
    if val is None or pd.isna(val):
        return None
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return None


def clean_float(val: Any) -> Optional[float]:
    """Convierte un valor a float de forma segura."""
    if val is None or pd.isna(val):
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


def clean_date(val: Any) -> Optional[datetime]:
    """Convierte un valor a datetime de forma segura."""
    if val is None or pd.isna(val):
        return None
    if isinstance(val, datetime):
        return val
    if isinstance(val, pd.Timestamp):
        return val.to_pydatetime()
    try:
        return pd.to_datetime(val)
    except Exception:
        return None


def clean_bool_flag(val: Any) -> bool:
    """Convierte un valor de bandera ('X', 'x', 1, True) a booleano."""
    if val is None or pd.isna(val):
        return False
    s = str(val).strip().upper()
    return s in ("X", "1", "TRUE", "SI", "SÍ")


def get_province_from_dpa(dpa_code: Any) -> tuple[Optional[str], Optional[str], Optional[str], Optional[str]]:
    """
    Dado un código DPA (2 o 4 dígitos), retorna:
    (provinceCode, provinceName, municipalityCode, municipalityName)
    Busca en la BD si está disponible, si no usa el mapeo local.
    """
    if dpa_code is None or pd.isna(dpa_code):
        return None, None, None, None

    dpa_str = str(int(float(dpa_code))) if isinstance(dpa_code, (int, float)) else str(dpa_code).strip()
    
    # Determinar código de provincia (2 dígitos)
    if len(dpa_str) >= 2:
        prov_code = dpa_str[:2]
    else:
        prov_code = dpa_str.zfill(2)
    
    prov_name = PROVINCE_DPA_MAP.get(prov_code)
    
    # Si el código es de 4+ dígitos, es un municipio
    muni_code = dpa_str if len(dpa_str) >= 4 else None
    muni_name = None  # Se resolverá desde la BD o lookup
    
    return prov_code, prov_name, muni_code, muni_name


# ============================================================================
# CLASE PRINCIPAL DE IMPORTACIÓN
# ============================================================================
class RegistroMercantilImporter:
    """Importador masivo de registros mercantiles desde Excel a PostgreSQL."""

    def __init__(self, db_url: str):
        self.db_url = db_url
        self.conn = None
        self.cur = None
        self.municipality_cache = {}  # code -> name
        self.stats = {
            "cooperativas_inserted": 0,
            "cooperativas_skipped": 0,
            "cooperativas_errors": 0,
            "mipymes_inserted": 0,
            "mipymes_skipped": 0,
            "mipymes_errors": 0,
            "aei_inserted": 0,
            "sm_inserted": 0,
            "modifications_inserted": 0,
        }

    def connect(self):
        """Establece conexión con PostgreSQL."""
        log.info(f"Conectando a PostgreSQL: {self.db_url[:30]}...")
        self.conn = psycopg2.connect(self.db_url)
        self.conn.autocommit = False
        self.cur = self.conn.cursor()
        log.info("Conexión establecida.")

    def close(self):
        """Cierra la conexión con PostgreSQL."""
        if self.cur:
            self.cur.close()
        if self.conn:
            self.conn.close()
        log.info("Conexión cerrada.")

    def load_municipality_cache(self):
        """Carga la caché de municipios desde la BD."""
        self.cur.execute('SELECT "code", "name", "provinceCode" FROM "Municipality"')
        rows = self.cur.fetchall()
        for code, name, prov_code in rows:
            self.municipality_cache[code] = {"name": name, "provinceCode": prov_code}
        log.info(f"Caché de municipios cargada: {len(self.municipality_cache)} registros.")

    def get_municipality_name(self, muni_code: Optional[str]) -> Optional[str]:
        """Obtiene el nombre del municipio desde la caché."""
        if not muni_code:
            return None
        return self.municipality_cache.get(muni_code, {}).get("name")

    def insert_searchable_name(self, record: dict) -> Optional[int]:
        """
        Inserta un registro en SearchableName.
        Retorna el ID insertado o None si falló/fue duplicado.
        Usa ON CONFLICT ("nire") DO NOTHING para evitar duplicados.
        """
        cols = []
        vals = []
        placeholders = []

        for key, value in record.items():
            if value is not None:
                cols.append(f'"{key}"')
                vals.append(value)
                placeholders.append("%s")

        if not cols:
            log.warning("Registro vacío, saltando.")
            return None

        # Agregar timestamps si no están
        if '"createdAt"' not in cols:
            cols.append('"createdAt"')
            vals.append(datetime.now())
            placeholders.append("%s")
        if '"updatedAt"' not in cols:
            cols.append('"updatedAt"')
            vals.append(datetime.now())
            placeholders.append("%s")

        query = f"""
            INSERT INTO "SearchableName" ({', '.join(cols)})
            VALUES ({', '.join(placeholders)})
            ON CONFLICT ("nire") DO NOTHING
            RETURNING "id"
        """

        try:
            self.cur.execute(query, vals)
            result = self.cur.fetchone()
            if result:
                return result[0]
            else:
                return None  # Duplicado por NIRE
        except Exception as e:
            log.error(f"Error insertando registro: {e}")
            log.error(f"  Datos: name={record.get('name')}, nire={record.get('nire')}")
            self.conn.rollback()
            return -1  # Error

    def insert_modification(self, searchable_name_id: int, mod_type: str, 
                            description: Optional[str] = None,
                            source_text: Optional[str] = None):
        """Inserta un registro de modificación."""
        try:
            self.cur.execute("""
                INSERT INTO "Modification" ("searchableNameId", "modificationType", "description", "sourceText", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (searchable_name_id, mod_type, description, source_text, datetime.now(), datetime.now()))
        except Exception as e:
            log.error(f"Error insertando modificación: {e}")

    # ====================================================================
    # IMPORTACIÓN: COOPERATIVAS AGROPECUARIAS
    # ====================================================================
    def import_cooperativas(self, filepath: str):
        """
        Importa las cooperativas agropecuarias (UBPC, CPA, CCS) desde el Excel.
        Cada hoja define el tipo de cooperativa.
        """
        log.info(f"=" * 70)
        log.info(f"Importando Cooperativas Agropecuarias: {filepath}")
        log.info(f"=" * 70)

        sheets_config = {
            "UBPC": {"type": "UBPC", "category": "Cooperativa Agropecuaria",
                     "label": "Unidad Básica de Producción Cooperativa"},
            "CPA":  {"type": "CPA",  "category": "Cooperativa Agropecuaria",
                     "label": "Cooperativa de Producción Agropecuaria"},
            "CCS":  {"type": "CCS",  "category": "Cooperativa Agropecuaria",
                     "label": "Cooperativa de Crédito y Servicio"},
        }

        for sheet_name, config in sheets_config.items():
            log.info(f"--- Procesando hoja: {sheet_name} ({config['label']}) ---")
            
            try:
                # Leer la hoja completa sin header (necesitamos detectar filas de datos)
                df = pd.read_excel(filepath, sheet_name=sheet_name, header=None)
            except Exception as e:
                log.error(f"Error leyendo hoja {sheet_name}: {e}")
                continue

            # Detectar filas de datos reales
            # La estructura es: fila 0 = header, fila 1 = totales, fila 2+ = datos
            # Filtrar filas donde COD (columna 0) es un número válido
            data_rows = []
            for idx, row in df.iterrows():
                cod_val = row.iloc[0]
                # Saltar headers y totales: COD debe ser numérico y > 0
                if cod_val is not None and not pd.isna(cod_val):
                    try:
                        cod_num = int(float(cod_val))
                        if cod_num > 0 and cod_num < 100000:
                            data_rows.append(idx)
                    except (ValueError, TypeError):
                        continue

            if not data_rows:
                log.warning(f"  No se encontraron datos en hoja {sheet_name}")
                continue

            log.info(f"  Encontrados {len(data_rows)} registros en hoja {sheet_name}")

            # Normalizar nombres de columnas (la hoja CCS puede tener espacios extra)
            # Mapeo posicional de columnas:
            # 0: COD, 1: DENOMINACIÓN, 2: T, 3: F, 4: H, 5: AZCUBA, 6: MINAG,
            # 7: DPA, 8: MUNICIPIO, 9: CNAE, 10: NAE, 11: ORGA, 12: DESCO,
            # 13: BAJA, 14: ALTA, 15: ESTADO

            for idx in data_rows:
                row = df.iloc[idx]
                
                cod = clean_int(row.iloc[0])
                denominacion = clean_text(row.iloc[1])
                dpa_raw = row.iloc[7]
                municipio = clean_text(row.iloc[8])
                cnae = clean_text(row.iloc[9])  # Puede tener espacio en CCS
                if cnae and cnae.startswith(" "):
                    cnae = cnae.strip()
                nae = clean_text(row.iloc[10])
                orga = clean_int(row.iloc[11])
                desco = clean_text(row.iloc[12])
                baja = clean_date(row.iloc[13])
                alta = clean_date(row.iloc[14])
                estado = clean_text(row.iloc[15])

                if not denominacion:
                    continue

                # Determinar provincia y municipio desde DPA
                prov_code, prov_name, muni_code, _ = get_province_from_dpa(dpa_raw)
                
                # Si tenemos código de municipio, buscar nombre en caché
                if muni_code and not municipio:
                    municipio = self.get_municipality_name(muni_code)

                # Determinar status
                if estado and "BAJA" in estado.upper():
                    status = estado.strip().upper()
                else:
                    status = "VIGENTE"

                # NIRE: usar COD como NIRE con prefijo del tipo
                nire = f"COOP-{config['type']}-{cod}"

                # Visibilidad: todas visibles excepto las de baja
                visible = status == "VIGENTE"

                record = {
                    "name": denominacion,
                    "nire": nire,
                    "type": config["type"],
                    "category": config["category"],
                    "province": prov_name,
                    "provinceCode": prov_code,
                    "municipality": municipio,
                    "municipalityCode": muni_code,
                    "status": status,
                    "visible": visible,
                    "registrationDate": alta,
                    "deregistrationDate": baja,
                    "cnae": cnae,
                    "economicActivity": nae,
                    "organizationCode": orga,
                    "organizationName": desco,
                    "sourceFile": os.path.basename(filepath),
                    "sourceSheet": sheet_name,
                }

                # Eliminar valores None para no insertar NULLs innecesarios
                record = {k: v for k, v in record.items() if v is not None}

                inserted_id = self.insert_searchable_name(record)
                if inserted_id and inserted_id > 0:
                    self.stats["cooperativas_inserted"] += 1
                elif inserted_id == -1:
                    self.stats["cooperativas_errors"] += 1
                else:
                    self.stats["cooperativas_skipped"] += 1

            # Commit parcial por hoja
            self.conn.commit()
            log.info(f"  Hoja {sheet_name}: {self.stats['cooperativas_inserted']} insertados, "
                     f"{self.stats['cooperativas_skipped']} duplicados, "
                     f"{self.stats['cooperativas_errors']} errores")

        log.info(f"Total Cooperativas: {self.stats['cooperativas_inserted']} insertados")

    # ====================================================================
    # IMPORTACIÓN: MIPYMES (hojas por provincia)
    # ====================================================================
    def import_mipymes(self, filepath: str):
        """
        Importa las MIPYMES desde el Excel.
        Cada hoja es una provincia. Las primeras 2 filas son headers merged,
        la fila 3 es totales, la fila 4+ son datos.
        """
        log.info(f"=" * 70)
        log.info(f"Importando MIPYMES: {filepath}")
        log.info(f"=" * 70)

        # Nombres de columnas normalizados para las hojas de provincias
        # Row 0: NO., _, _, _, Denominación, Datos de Inscripción, _, _, _, 
        #        Actividad Principal, DOMICILIO SOCIAL, Representante, 
        #        Teléfono, Correo electrónico, Modificaciones realizadas, _, _, _, _, _, _, _, _, _, _
        # Row 1: _, SRL, SURL, ESTATAL, _, Tomo, Folio, Hoja, Fecha, _, _, _, _, _,
        #        _, Mod.De Denominación, Mod.De Domicilio, Mod.De Objeto Social,
        #        Incoporación de Socios, Establecimiento, Baja de Socios, Disolución,
        #        Liquidación, Extinción, Cancelación

        province_sheets = [
            "PINAR R.", "ARTEMISA", "MAYABEQUE", "LA HABANA", "MATANZAS",
            "VILLA CLARA", "CIENFUEGOS", "SANCTI SP.", "CIEGO A", "CAMAG",
            "LAS TUNAS", "HOLGUIN", "GRANMA", "SANTIAGO C", "GUANTANAMO", "ISLA J"
        ]

        for sheet_name in province_sheets:
            prov_code = MIPYMES_SHEET_TO_DPA.get(sheet_name)
            prov_name = PROVINCE_DPA_MAP.get(prov_code, sheet_name) if prov_code else sheet_name

            log.info(f"--- Procesando hoja: {sheet_name} -> {prov_name} ---")

            try:
                # Leer sin header para manejar las 2 filas de encabezado merged
                df = pd.read_excel(filepath, sheet_name=sheet_name, header=None)
            except Exception as e:
                log.error(f"Error leyendo hoja {sheet_name}: {e}")
                continue

            # Detectar filas de datos: columna 0 (NO.) debe ser numérica y > 0
            # Saltar las 3 primeras filas (header + header + totales)
            data_rows = []
            for idx, row in df.iterrows():
                no_val = row.iloc[0]
                if no_val is not None and not pd.isna(no_val):
                    try:
                        no_num = int(float(no_val))
                        if no_num > 0 and no_num < 100000:
                            data_rows.append(idx)
                    except (ValueError, TypeError):
                        continue

            if not data_rows:
                log.warning(f"  No se encontraron datos en hoja {sheet_name}")
                continue

            log.info(f"  Encontrados {len(data_rows)} registros en hoja {sheet_name}")

            for idx in data_rows:
                row = df.iloc[idx]

                # Leer campos por posición
                no_val = clean_int(row.iloc[0])
                srl = clean_bool_flag(row.iloc[1])
                surl = clean_bool_flag(row.iloc[2])
                estatal = clean_bool_flag(row.iloc[3])
                denominacion = clean_text(row.iloc[4])
                tomo = clean_text(row.iloc[5])
                folio = clean_int(row.iloc[6])
                hoja = clean_int(row.iloc[7])
                fecha = clean_date(row.iloc[8])
                actividad = clean_text(row.iloc[9])
                domicilio = clean_text(row.iloc[10])
                representante = clean_text(row.iloc[11])
                telefono = clean_text(row.iloc[12])
                correo = clean_text(row.iloc[13])
                modificaciones = clean_text(row.iloc[14]) if len(row) > 14 else None

                # Flags de modificaciones (columnas 15-24)
                mod_denominacion = clean_bool_flag(row.iloc[15]) if len(row) > 15 else False
                mod_domicilio = clean_bool_flag(row.iloc[16]) if len(row) > 16 else False
                mod_objeto_social = clean_bool_flag(row.iloc[17]) if len(row) > 17 else False
                incorporacion_socios = clean_bool_flag(row.iloc[18]) if len(row) > 18 else False
                establecimiento = clean_bool_flag(row.iloc[19]) if len(row) > 19 else False
                baja_socios = clean_bool_flag(row.iloc[20]) if len(row) > 20 else False
                disolucion = clean_bool_flag(row.iloc[21]) if len(row) > 21 else False
                liquidacion = clean_bool_flag(row.iloc[22]) if len(row) > 22 else False
                extincion = clean_bool_flag(row.iloc[23]) if len(row) > 23 else False
                cancelacion = clean_bool_flag(row.iloc[24]) if len(row) > 24 else False

                if not denominacion:
                    continue

                # Determinar tipo de MIPYME
                if srl:
                    entity_type = "SRL"
                elif surl:
                    entity_type = "SURL"
                elif estatal:
                    entity_type = "ESTATAL"
                else:
                    entity_type = "MIPYME"

                # Determinar status
                if cancelacion:
                    status = "CANCELADA"
                elif extincion:
                    status = "EXTINGUIDA"
                elif liquidacion:
                    status = "LIQUIDACIÓN"
                elif disolucion:
                    status = "DISUELTA"
                else:
                    status = "VIGENTE"

                # NIRE: MIPYME-{provincia}-{NO}
                nire = f"MIPYME-{prov_code}-{no_val}" if no_val else None

                # Intentar extraer municipio del domicilio o del NIRE
                municipio = None
                muni_code = None

                visible = status == "VIGENTE"

                record = {
                    "name": denominacion,
                    "nire": nire,
                    "type": entity_type,
                    "category": "MIPYME",
                    "province": prov_name,
                    "provinceCode": prov_code,
                    "municipality": municipio,
                    "municipalityCode": muni_code,
                    "status": status,
                    "visible": visible,
                    "registrationDate": fecha,
                    "volume": tomo,
                    "folio": folio,
                    "sheet": hoja,
                    "address": domicilio,
                    "legalRepresentative": representante,
                    "phone": telefono,
                    "email": correo,
                    "modifications": modificaciones,
                    "modDenominacion": mod_denominacion,
                    "modDomicilio": mod_domicilio,
                    "modObjetoSocial": mod_objeto_social,
                    "incorporacionSocios": incorporacion_socios,
                    "establecimiento": establecimiento,
                    "bajaSocios": baja_socios,
                    "disolucion": disolucion,
                    "liquidacion": liquidacion,
                    "extincion": extincion,
                    "cancelacion": cancelacion,
                    "sourceFile": os.path.basename(filepath),
                    "sourceSheet": sheet_name,
                }

                # Eliminar valores None
                record = {k: v for k, v in record.items() if v is not None}

                inserted_id = self.insert_searchable_name(record)
                if inserted_id and inserted_id > 0:
                    self.stats["mipymes_inserted"] += 1

                    # Registrar modificaciones en tabla aparte si hay texto
                    if modificaciones and inserted_id:
                        # Registrar la modificación general
                        self.insert_modification(
                            searchable_name_id=inserted_id,
                            mod_type="Modificaciones Generales",
                            description=modificaciones,
                            source_text=modificaciones,
                        )
                        self.stats["modifications_inserted"] += 1

                    # Registrar flags de modificaciones como registros individuales
                    mod_flags = [
                        ("Mod. De Denominación", mod_denominacion),
                        ("Mod. De Domicilio", mod_domicilio),
                        ("Mod. De Objeto Social", mod_objeto_social),
                        ("Incorporación de Socios", incorporacion_socios),
                        ("Establecimiento", establecimiento),
                        ("Baja de Socios", baja_socios),
                        ("Disolución", disolucion),
                        ("Liquidación", liquidacion),
                        ("Extinción", extincion),
                        ("Cancelación", cancelacion),
                    ]
                    for mod_type, flag in mod_flags:
                        if flag and inserted_id:
                            self.insert_modification(
                                searchable_name_id=inserted_id,
                                mod_type=mod_type,
                                description=f"Registrada modificación tipo: {mod_type}",
                            )
                            self.stats["modifications_inserted"] += 1

                elif inserted_id == -1:
                    self.stats["mipymes_errors"] += 1
                else:
                    self.stats["mipymes_skipped"] += 1

            # Commit por hoja
            self.conn.commit()
            log.info(f"  Hoja {sheet_name}: insertados={self.stats['mipymes_inserted']}, "
                     f"duplicados={self.stats['mipymes_skipped']}, errores={self.stats['mipymes_errors']}")

        log.info(f"Total MIPYMES: {self.stats['mipymes_inserted']} insertados")

    # ====================================================================
    # IMPORTACIÓN: AEI (Asociaciones Económicas Internacionales)
    # ====================================================================
    def import_aei(self, filepath: str):
        """Importa las AEI desde la hoja correspondiente del MIPYMES."""
        log.info(f"=" * 70)
        log.info("Importando AEI (Asociaciones Económicas Internacionales)")
        log.info(f"=" * 70)

        try:
            df = pd.read_excel(filepath, sheet_name="AEI", header=None)
        except Exception as e:
            log.error(f"Error leyendo hoja AEI: {e}")
            return

        # Estructura: Row 0 = header, Row 1 = totales, Row 2+ = datos
        # Columnas: 0:DESFO, 1:DESC, 2:DESC_DPA_SE, 3:CNAE, 4:DESCN,
        #           5:count, 6:DESCO, 7:DESCU, 8:CORTA, 9:BAJA, 10:ALTA,
        #           11:DESCRIPCION EMPLEADORA, 12:extra

        data_rows = []
        for idx, row in df.iterrows():
            desc = row.iloc[1] if len(row) > 1 else None
            if desc is not None and not pd.isna(desc):
                desc_str = str(desc).strip()
                # Saltar fila de totales (número) y header
                if desc_str and not desc_str.replace(".", "").replace(",", "").isdigit():
                    if desc_str != "DESC":
                        data_rows.append(idx)

        log.info(f"  Encontrados {len(data_rows)} registros AEI")

        for idx in data_rows:
            row = df.iloc[idx]

            denominacion = clean_text(row.iloc[1])
            municipio_text = clean_text(row.iloc[2])
            cnae = clean_text(row.iloc[3])
            nae = clean_text(row.iloc[4])
            desco = clean_text(row.iloc[6])
            descu = clean_text(row.iloc[7])
            corta = clean_text(row.iloc[8])
            baja = clean_date(row.iloc[9])
            alta = clean_date(row.iloc[10])
            employer_desc = clean_text(row.iloc[11]) if len(row) > 11 else None

            if not denominacion:
                continue

            # Determinar provincia desde el municipio (buscar en caché)
            prov_code = None
            prov_name = None
            muni_code = None
            if municipio_text:
                # Buscar municipio en la caché por nombre (insensible a mayúsculas)
                for code, info in self.municipality_cache.items():
                    if info["name"].upper() == municipio_text.upper():
                        muni_code = code
                        prov_code = info["provinceCode"]
                        prov_name = PROVINCE_DPA_MAP.get(prov_code)
                        break

            # Status
            if baja:
                status = "BAJA"
            else:
                status = "VIGENTE"

            # NIRE
            nire = f"AEI-{idx}"

            visible = status == "VIGENTE"

            record = {
                "name": denominacion,
                "nire": nire,
                "type": "AEI",
                "category": "Asociación Económica Internacional",
                "province": prov_name,
                "provinceCode": prov_code,
                "municipality": municipio_text,
                "municipalityCode": muni_code,
                "status": status,
                "visible": visible,
                "registrationDate": alta,
                "deregistrationDate": baja,
                "cnae": cnae,
                "economicActivity": nae,
                "organizationName": desco,
                "parentOrganization": descu,
                "shortName": corta,
                "employerDescription": employer_desc,
                "sourceFile": os.path.basename(filepath),
                "sourceSheet": "AEI",
            }

            record = {k: v for k, v in record.items() if v is not None}

            inserted_id = self.insert_searchable_name(record)
            if inserted_id and inserted_id > 0:
                self.stats["aei_inserted"] += 1
            elif inserted_id == -1:
                self.stats["mipymes_errors"] += 1
            else:
                self.stats["mipymes_skipped"] += 1

        self.conn.commit()
        log.info(f"Total AEI: {self.stats['aei_inserted']} insertados")

    # ====================================================================
    # IMPORTACIÓN: SM (Sociedades Mercantiles)
    # ====================================================================
    def import_sm(self, filepath: str):
        """Importa las Sociedades Mercantiles desde la hoja SM del MIPYMES."""
        log.info(f"=" * 70)
        log.info("Importando SM (Sociedades Mercantiles)")
        log.info(f"=" * 70)

        try:
            df = pd.read_excel(filepath, sheet_name="SM", header=None)
        except Exception as e:
            log.error(f"Error leyendo hoja SM: {e}")
            return

        # Estructura: Row 0 = header, Row 1 = totales, Row 2+ = datos
        # Columnas: 0:DESFO, 1:DESC, 2:DESC_DPA_SE, 3:DPA, 4:CNAE, 5:DESCN,
        #           6:DESCO, 7:DESCU, 8:CORTA, 9:BAJA, 10:ALTA, 11:DESC ESTADO

        data_rows = []
        for idx, row in df.iterrows():
            desc = row.iloc[1] if len(row) > 1 else None
            if desc is not None and not pd.isna(desc):
                desc_str = str(desc).strip()
                if desc_str and not desc_str.replace(".", "").replace(",", "").isdigit():
                    if desc_str != "DESC":
                        data_rows.append(idx)

        log.info(f"  Encontrados {len(data_rows)} registros SM")

        for idx in data_rows:
            row = df.iloc[idx]

            denominacion = clean_text(row.iloc[1])
            municipio_text = clean_text(row.iloc[2])
            dpa_raw = row.iloc[3]
            cnae = clean_text(row.iloc[4])
            nae = clean_text(row.iloc[5])
            desco = clean_text(row.iloc[6])
            descu = clean_text(row.iloc[7])
            corta = clean_text(row.iloc[8])
            baja = clean_date(row.iloc[9])
            alta = clean_date(row.iloc[10])
            desc_estado = clean_text(row.iloc[11]) if len(row) > 11 else None

            if not denominacion:
                continue

            # Provincia desde DPA
            prov_code, prov_name, muni_code, _ = get_province_from_dpa(dpa_raw)
            if muni_code and not municipio_text:
                municipio_text = self.get_municipality_name(muni_code)

            # Status
            if baja:
                status = "BAJA"
            elif desc_estado:
                status = desc_estado.upper()
            else:
                status = "VIGENTE"

            # NIRE
            nire = f"SM-{idx}"

            visible = status == "VIGENTE"

            record = {
                "name": denominacion,
                "nire": nire,
                "type": "SM",
                "category": "Sociedad Mercantil",
                "province": prov_name,
                "provinceCode": prov_code,
                "municipality": municipio_text,
                "municipalityCode": muni_code,
                "status": status,
                "visible": visible,
                "registrationDate": alta,
                "deregistrationDate": baja,
                "cnae": cnae,
                "economicActivity": nae,
                "organizationName": desco,
                "parentOrganization": descu,
                "shortName": corta,
                "descEstado": desc_estado,
                "sourceFile": os.path.basename(filepath),
                "sourceSheet": "SM",
            }

            record = {k: v for k, v in record.items() if v is not None}

            inserted_id = self.insert_searchable_name(record)
            if inserted_id and inserted_id > 0:
                self.stats["sm_inserted"] += 1
            elif inserted_id == -1:
                self.stats["mipymes_errors"] += 1
            else:
                self.stats["mipymes_skipped"] += 1

        self.conn.commit()
        log.info(f"Total SM: {self.stats['sm_inserted']} insertados")

    # ====================================================================
    # IMPORTACIÓN: RCM (Registro Central Mercantil)
    # ====================================================================
    def import_rcm(self, filepath: str):
        """Importa los registros del RCM si hay datos."""
        log.info(f"=" * 70)
        log.info("Importando RCM (Registro Central Mercantil)")
        log.info(f"=" * 70)

        try:
            df = pd.read_excel(filepath, sheet_name="RCM", header=None)
        except Exception as e:
            log.error(f"Error leyendo hoja RCM: {e}")
            return

        # Misma estructura que las hojas de provincia pero con tipos:
        # MIXTA, CAPITAL NACIONAL, CAPITAL EXTRANJERO (SA), CONTRATOS DE AEI
        # Row 0: NO., _, _, _, _, Denominación, Datos de Inscripción, ...
        # Row 1: _, MIXTA, CAPITAL NACIONAL, CAPITAL EXTRANJERO (SA), CONTRATOS DE AEI, ...

        data_rows = []
        for idx, row in df.iterrows():
            no_val = row.iloc[0] if len(row) > 0 else None
            if no_val is not None and not pd.isna(no_val):
                try:
                    no_num = int(float(no_val))
                    if no_num > 0 and no_num < 100000:
                        data_rows.append(idx)
                except (ValueError, TypeError):
                    continue

        if not data_rows:
            log.info("  No se encontraron datos en hoja RCM")
            return

        log.info(f"  Encontrados {len(data_rows)} registros RCM")

        for idx in data_rows:
            row = df.iloc[idx]

            no_val = clean_int(row.iloc[0])
            mixta = clean_bool_flag(row.iloc[1])
            cap_nacional = clean_bool_flag(row.iloc[2])
            cap_extranjero = clean_bool_flag(row.iloc[3])
            contratos_aei = clean_bool_flag(row.iloc[4])
            denominacion = clean_text(row.iloc[5]) if len(row) > 5 else None
            tomo = clean_text(row.iloc[6]) if len(row) > 6 else None
            folio = clean_int(row.iloc[7]) if len(row) > 7 else None
            hoja = clean_int(row.iloc[8]) if len(row) > 8 else None
            fecha = clean_date(row.iloc[9]) if len(row) > 9 else None
            actividad = clean_text(row.iloc[10]) if len(row) > 10 else None
            domicilio = clean_text(row.iloc[11]) if len(row) > 11 else None
            representante = clean_text(row.iloc[12]) if len(row) > 12 else None

            if not denominacion:
                continue

            # Tipo
            if mixta:
                entity_type = "MIXTA"
            elif cap_nacional:
                entity_type = "CAPITAL NACIONAL"
            elif cap_extranjero:
                entity_type = "CAPITAL EXTRANJERO"
            elif contratos_aei:
                entity_type = "CONTRATO AEI"
            else:
                entity_type = "RCM"

            nire = f"RCM-{no_val}" if no_val else f"RCM-{idx}"

            record = {
                "name": denominacion,
                "nire": nire,
                "type": entity_type,
                "category": "Registro Central Mercantil",
                "province": "La Habana",  # RCM está en La Habana
                "provinceCode": "23",
                "status": "VIGENTE",
                "visible": True,
                "registrationDate": fecha,
                "volume": tomo,
                "folio": folio,
                "sheet": hoja,
                "address": domicilio,
                "legalRepresentative": representante,
                "sourceFile": os.path.basename(filepath),
                "sourceSheet": "RCM",
            }

            record = {k: v for k, v in record.items() if v is not None}

            inserted_id = self.insert_searchable_name(record)
            if inserted_id and inserted_id > 0:
                self.stats["mipymes_inserted"] += 1

        self.conn.commit()

    # ====================================================================
    # MÉTODO PRINCIPAL
    # ====================================================================
    def run(self, cooperativas_path: str, mipymes_path: str, 
            skip_cooperativas: bool = False, skip_mipymes: bool = False):
        """Ejecuta la importación completa."""

        start_time = datetime.now()
        log.info("=" * 70)
        log.info("INICIO DE IMPORTACIÓN MASIVA - REGISTRO MERCANTIL DE CUBA")
        log.info(f"Fecha: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        log.info("=" * 70)

        try:
            self.connect()
            self.load_municipality_cache()

            # 1. Importar Cooperativas Agropecuarias
            if not skip_cooperativas and cooperativas_path:
                if os.path.exists(cooperativas_path):
                    self.import_cooperativas(cooperativas_path)
                else:
                    log.error(f"Archivo no encontrado: {cooperativas_path}")

            # 2. Importar MIPYMES
            if not skip_mipymes and mipymes_path:
                if os.path.exists(mipymes_path):
                    self.import_mipymes(mipymes_path)
                    self.import_aei(mipymes_path)
                    self.import_sm(mipymes_path)
                    self.import_rcm(mipymes_path)
                else:
                    log.error(f"Archivo no encontrado: {mipymes_path}")

            # Commit final
            self.conn.commit()

        except Exception as e:
            log.error(f"Error general: {e}")
            if self.conn:
                self.conn.rollback()
            raise
        finally:
            self.close()

        # Resumen
        end_time = datetime.now()
        duration = end_time - start_time
        log.info("=" * 70)
        log.info("RESUMEN DE IMPORTACIÓN")
        log.info("=" * 70)
        log.info(f"  Cooperativas Agropecuarias insertadas: {self.stats['cooperativas_inserted']}")
        log.info(f"  Cooperativas duplicadas/saltadas:      {self.stats['cooperativas_skipped']}")
        log.info(f"  Cooperativas con errores:              {self.stats['cooperativas_errors']}")
        log.info(f"  MIPYMES insertadas:                    {self.stats['mipymes_inserted']}")
        log.info(f"  MIPYMES duplicadas/saltadas:           {self.stats['mipymes_skipped']}")
        log.info(f"  MIPYMES con errores:                   {self.stats['mipymes_errors']}")
        log.info(f"  AEI insertadas:                        {self.stats['aei_inserted']}")
        log.info(f"  Sociedades Mercantiles insertadas:     {self.stats['sm_inserted']}")
        log.info(f"  Modificaciones registradas:            {self.stats['modifications_inserted']}")
        total = (self.stats['cooperativas_inserted'] + self.stats['mipymes_inserted'] +
                 self.stats['aei_inserted'] + self.stats['sm_inserted'])
        log.info(f"  TOTAL REGISTROS INSERTADOS:            {total}")
        log.info(f"  Duración:                              {duration}")
        log.info("=" * 70)


# ============================================================================
# PUNTO DE ENTRADA
# ============================================================================
def main():
    parser = argparse.ArgumentParser(
        description="Importación masiva de registros mercantiles desde Excel a PostgreSQL"
    )
    parser.add_argument(
        "--db-url",
        type=str,
        default=os.environ.get("DATABASE_URL", "postgresql://portal_rmc:PortalRMC2026!Secure@localhost:5432/registro_mercantil"),
        help="URL de conexión PostgreSQL (o variable DATABASE_URL)",
    )
    parser.add_argument(
        "--cooperativas",
        type=str,
        default="/home/z/my-project/upload/Cooperativas Agropecuarias Enero 2026.xlsx",
        help="Ruta al archivo Excel de Cooperativas Agropecuarias",
    )
    parser.add_argument(
        "--mipymes",
        type=str,
        default="/home/z/my-project/upload/BASE DE DATOS MIPYMES REG.MERCANTIL JULIO 2025.xlsx",
        help="Ruta al archivo Excel de MIPYMES",
    )
    parser.add_argument(
        "--skip-cooperativas",
        action="store_true",
        help="Saltar importación de cooperativas",
    )
    parser.add_argument(
        "--skip-mipymes",
        action="store_true",
        help="Saltar importación de MIPYMES",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Solo analizar, no insertar en BD",
    )

    args = parser.parse_args()

    if args.dry_run:
        log.info("MODO DRY-RUN: Solo se analizarán los archivos, no se insertará nada.")

    importer = RegistroMercantilImporter(db_url=args.db_url)
    importer.run(
        cooperativas_path=args.cooperativas,
        mipymes_path=args.mipymes,
        skip_cooperativas=args.skip_cooperativas,
        skip_mipymes=args.skip_mipymes,
    )


if __name__ == "__main__":
    main()
