'use client';

import React from 'react';
import { Plus, Pencil, Trash2, Loader2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
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
import type { Procedure, ProcedureDocument } from './cms-types';
import {
  getProcedures, createProcedure, updateProcedure, deleteProcedure,
  getProcedureDocuments, uploadProcedureDocument, deleteProcedureDocument,
} from './cms-api';
import FileUpload, { FileListItem } from './FileUpload';
import SortableSteps from './SortableSteps';

interface FormData {
  title: string; description: string; icon: string; time: string;
  cost: string; requirements: string; steps: string; order: number; visible: boolean;
}

const EMPTY: FormData = { title: '', description: '', icon: '', time: '', cost: '', requirements: '', steps: '', order: 0, visible: true };

export default function CmsProcedures() {
  const [items, setItems] = React.useState<Procedure[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormData>(EMPTY);
  const [submitting, setSubmitting] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Documents
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [documents, setDocuments] = React.useState<ProcedureDocument[]>([]);
  const [docsLoading, setDocsLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const load = React.useCallback(async () => {
    try { setLoading(true); setError(null); setItems(await getProcedures()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Error al cargar trámites'); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const loadDocuments = React.useCallback(async (procedureId: string) => {
    try { setDocsLoading(true); setDocuments(await getProcedureDocuments(procedureId)); }
    catch (e) { toast.error('Error al cargar documentos'); }
    finally { setDocsLoading(false); }
  }, []);

  const toggleExpand = (id: string) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    loadDocuments(id);
  };

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (s: Procedure) => {
    setEditingId(s.id);
    setForm({ title: s.title, description: s.description, icon: s.icon, time: s.time, cost: s.cost, requirements: s.requirements, steps: s.steps, order: s.order, visible: s.visible });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return; }
    try {
      setSubmitting(true);
      const payload = { title: form.title.trim(), description: form.description.trim(), icon: form.icon.trim() || 'FileText', time: form.time.trim(), cost: form.cost.trim(), requirements: form.requirements.trim(), steps: form.steps.trim(), order: form.order, visible: form.visible };
      if (editingId) { await updateProcedure(editingId, payload); toast.success('Trámite actualizado'); }
      else { await createProcedure(payload); toast.success('Trámite creado'); }
      setDialogOpen(false); load();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error al guardar'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { setDeleting(true); await deleteProcedure(deleteId); toast.success('Trámite eliminado'); setDeleteId(null); load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error al eliminar'); }
    finally { setDeleting(false); }
  };

  const toggleVisible = async (s: Procedure) => {
    try { await updateProcedure(s.id, { visible: !s.visible }); load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };

  const handleUploadFiles = async (procedureId: string, files: FileList) => {
    try {
      setUploading(true);
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData();
        fd.append('file', files[i]);
        fd.append('title', files[i].name);
        await uploadProcedureDocument(procedureId, fd);
      }
      toast.success(`${files.length} documento(s) subido(s)`);
      loadDocuments(procedureId);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error al subir'); }
    finally { setUploading(false); }
  };

  const handleDeleteDocument = async (procedureId: string, docId: string) => {
    try { await deleteProcedureDocument(procedureId, docId); toast.success('Documento eliminado'); loadDocuments(procedureId); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error al eliminar'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Trámites</h2>
          <p className="text-sm text-gray-500">Administre los trámites y documentos asociados</p>
        </div>
        <Button onClick={openCreate} className="bg-[#1A1A1A] hover:bg-[#1A1A1A]-light"><Plus className="w-4 h-4 mr-2" />Nuevo Trámite</Button>
      </div>

      {error && <Card className="border-[#7A2A1E]/20 bg-[#7A2A1E]/5"><CardContent className="p-4"><p className="text-[#9E3A2E] text-sm">{error}</p></CardContent></Card>}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center"><p className="text-gray-400 text-sm">No hay trámites</p></div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <div className="divide-y divide-gray-100">
                {items.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-[#1A1A1A]/5 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-[#1A1A1A]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.title}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-gray-400">Tiempo: {item.time || '—'}</span>
                          <span className="text-xs text-gray-400">Costo: {item.cost || '—'}</span>
                        </div>
                      </div>
                      <Badge variant={item.visible ? 'default' : 'secondary'} className={item.visible ? 'bg-green-100 text-green-700' : ''}>
                        {item.visible ? 'Visible' : 'Oculto'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#1A1A1A]" onClick={() => openEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#9E3A2E]" onClick={() => setDeleteId(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400" onClick={() => toggleExpand(item.id)}>
                          {expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    {expandedId === item.id && (
                      <div className="px-6 pb-4 space-y-4 bg-gray-50/50 border-t border-gray-100">
                        <div className="flex items-center justify-between pt-3">
                          <h4 className="text-sm font-semibold text-gray-700">Documentos adjuntos</h4>
                          <div className="w-48">
                            <FileUpload
                              onFilesSelected={(files) => handleUploadFiles(item.id, files)}
                              className="!p-0"
                            />
                          </div>
                        </div>
                        {docsLoading ? (
                          <div className="space-y-2">{Array.from({ length: 2 }).map((_, j) => <Skeleton key={j} className="h-10 w-full" />)}</div>
                        ) : documents.length === 0 ? (
                          <p className="text-sm text-gray-400 py-2">No hay documentos adjuntos</p>
                        ) : (
                          <div className="space-y-2">
                            {documents.map((doc) => (
                              <FileListItem
                                key={doc.id}
                                file={{ id: doc.id, name: doc.name || doc.fileName, size: doc.fileSize, url: doc.url }}
                                onDownload={(f) => window.open(f.url, '_blank')}
                                onDelete={(f) => handleDeleteDocument(item.id, f.id)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Trámite' : 'Nuevo Trámite'}</DialogTitle>
            <DialogDescription>{editingId ? 'Modifique los datos del trámite' : 'Complete los datos para crear un trámite'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2"><Label>Título <span className="text-[#9E3A2E]">*</span></Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Icono</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
              <div className="space-y-2"><Label>Tiempo</Label><Input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="Ej: 5 días" /></div>
              <div className="space-y-2"><Label>Costo</Label><Input value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="Ej: $50" /></div>
            </div>
            <div className="space-y-2"><Label>Requisitos</Label><Textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={3} placeholder="Uno por línea" /></div>
            <SortableSteps
              value={form.steps}
              onChange={(val) => setForm({ ...form, steps: val })}
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Orden</Label><Input type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} /></div>
              <div className="flex items-center justify-between py-5"><Label>Visible</Label><Switch checked={form.visible} onCheckedChange={(c) => setForm({ ...form, visible: c })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-[#1A1A1A] hover:bg-[#1A1A1A]-light">{submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{editingId ? 'Guardar' : 'Crear'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar trámite?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. Se eliminarán también los documentos asociados.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-[#7A2A1E] hover:bg-[#7A2A1E]-light text-white">{deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
