'use client';

import React from 'react';
import { Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SearchableName } from './cms-types';
import { getSearchableNames, createSearchableName, updateSearchableName, deleteSearchableName } from './cms-api';

interface FormData {
  name: string; nire: string; type: string; province: string; status: string; visible: boolean;
}

const EMPTY: FormData = { name: '', nire: '', type: 'Sociedad', province: '', status: 'Vigente', visible: true };
const TYPES = ['Sociedad', 'Empresa Individual', 'Sucursal', 'Representación', 'Otro'];
const PROVINCES = ['La Habana', 'Santiago de Cuba', 'Camagüey', 'Holguín', 'Santa Clara', 'Bayamo', 'Cienfuegos', 'Pinar del Río', 'Matanzas', 'Las Tunas', 'Granma', 'Sancti Spíritus', 'Ciego de Ávila', 'Villa Clara', 'Manzanillo', 'Artemisa', 'Mayabeque', 'Isla de la Juventud'];
const STATUSES = ['Vigente', 'Disuelta', 'Suspendida', 'En Trámite'];

export default function CmsSearchNames() {
  const [items, setItems] = React.useState<SearchableName[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormData>(EMPTY);
  const [submitting, setSubmitting] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    try { setLoading(true); setError(null); setItems(await getSearchableNames()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Error al cargar nombres'); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const filtered = items.filter((item) => {
    const term = searchTerm.toLowerCase();
    return !term || item.name.toLowerCase().includes(term) || (item.nire || '').toLowerCase().includes(term) || item.province?.toLowerCase().includes(term);
  });

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (s: SearchableName) => {
    setEditingId(s.id);
    setForm({ name: s.name, nire: s.nire || '', type: s.type, province: s.province || '', status: s.status, visible: s.visible });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return; }
    try {
      setSubmitting(true);
      const payload = { name: form.name.trim(), nire: form.nire.trim() || undefined, type: form.type, province: form.province || undefined, status: form.status, visible: form.visible };
      if (editingId) { await updateSearchableName(editingId, payload); toast.success('Nombre actualizado'); }
      else { await createSearchableName(payload); toast.success('Nombre creado'); }
      setDialogOpen(false); load();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error al guardar'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { setDeleting(true); await deleteSearchableName(deleteId); toast.success('Nombre eliminado'); setDeleteId(null); load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error al eliminar'); }
    finally { setDeleting(false); }
  };

  const toggleVisible = async (s: SearchableName) => {
    try { await updateSearchableName(s.id, { visible: !s.visible }); load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Nombres Buscables</h2>
          <p className="text-sm text-gray-500">Administre los nombres y entidades disponibles en la búsqueda</p>
        </div>
        <Button onClick={openCreate} className="bg-[#1A1A1A] hover:bg-[#1A1A1A]-light"><Plus className="w-4 h-4 mr-2" />Nuevo Nombre</Button>
      </div>

      {error && <Card className="border-[#7A2A1E]/20 bg-[#7A2A1E]/5"><CardContent className="p-4"><p className="text-[#9E3A2E] text-sm">{error}</p></CardContent></Card>}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Buscar por nombre, NIRE o provincia..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center"><p className="text-gray-400 text-sm">{searchTerm ? 'Sin resultados' : 'No hay nombres buscables'}</p></div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>NIRE</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Provincia</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-24 text-center">Visible</TableHead>
                    <TableHead className="w-28 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s, i) => (
                    <motion.tr key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium text-gray-900">{s.name}</TableCell>
                      <TableCell><code className="text-xs bg-gray-100 px-2 py-1 rounded">{s.nire || '—'}</code></TableCell>
                      <TableCell><Badge variant="secondary">{s.type}</Badge></TableCell>
                      <TableCell className="text-sm text-gray-600">{s.province || '—'}</TableCell>
                      <TableCell><Badge variant={s.status === 'Vigente' ? 'default' : 'secondary'} className={s.status === 'Vigente' ? 'bg-green-100 text-green-700' : ''}>{s.status}</Badge></TableCell>
                      <TableCell className="text-center"><Switch checked={s.visible} onCheckedChange={() => toggleVisible(s)} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#1A1A1A]" onClick={() => openEdit(s)}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#9E3A2E]" onClick={() => setDeleteId(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Nombre' : 'Nuevo Nombre'}</DialogTitle>
            <DialogDescription>{editingId ? 'Modifique los datos' : 'Agregue un nuevo nombre o entidad'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2"><Label>Nombre <span className="text-[#9E3A2E]">*</span></Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>NIRE</Label><Input value={form.nire} onChange={(e) => setForm({ ...form, nire: e.target.value })} /></div>
              <div className="space-y-2"><Label>Tipo</Label>
                <select className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Provincia</Label>
                <select className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })}>
                  <option value="">— Sin provincia —</option>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label>Estado</Label>
                <select className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between py-1"><Label>Visible</Label><Switch checked={form.visible} onCheckedChange={(c) => setForm({ ...form, visible: c })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-[#1A1A1A] hover:bg-[#1A1A1A]-light">{submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{editingId ? 'Guardar' : 'Crear'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar nombre?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-[#7A2A1E] hover:bg-[#7A2A1E]-light text-white">{deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
