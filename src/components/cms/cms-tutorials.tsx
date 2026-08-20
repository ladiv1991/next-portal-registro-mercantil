'use client';

import React from 'react';
import { Plus, Pencil, Trash2, Loader2, Play, Eye } from 'lucide-react';
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
import type { VideoTutorial } from './cms-types';
import { getTutorials, createTutorial, updateTutorial, deleteTutorial } from './cms-api';
import { ImageUpload } from './CmsFileUpload';

interface FormData {
  title: string; description: string; videoUrl: string; thumbnailUrl: string;
  duration: string; category: string; order: number; visible: boolean;
}

const EMPTY: FormData = { title: '', description: '', videoUrl: '', thumbnailUrl: '', duration: '', category: 'General', order: 0, visible: true };
const CATEGORIES = ['General', 'Constitución', 'Modificación', 'Registro', 'Búsqueda', 'Pagos'];

export default function CmsTutorials() {
  const [items, setItems] = React.useState<VideoTutorial[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormData>(EMPTY);
  const [submitting, setSubmitting] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    try { setLoading(true); setError(null); setItems(await getTutorials()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Error al cargar tutoriales'); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (t: VideoTutorial) => {
    setEditingId(t.id);
    setForm({ title: t.title, description: t.description, videoUrl: t.videoUrl, thumbnailUrl: t.thumbnailUrl || '', duration: t.duration, category: t.category, order: t.order, visible: t.visible });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.videoUrl.trim()) { toast.error('Título y URL del video son obligatorios'); return; }
    try {
      setSubmitting(true);
      const payload = { title: form.title.trim(), description: form.description.trim(), videoUrl: form.videoUrl.trim(), thumbnailUrl: form.thumbnailUrl.trim() || undefined, duration: form.duration.trim(), category: form.category, order: form.order, visible: form.visible };
      if (editingId) { await updateTutorial(editingId, payload); toast.success('Tutorial actualizado'); }
      else { await createTutorial(payload); toast.success('Tutorial creado'); }
      setDialogOpen(false); load();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error al guardar'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { setDeleting(true); await deleteTutorial(deleteId); toast.success('Tutorial eliminado'); setDeleteId(null); load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error al eliminar'); }
    finally { setDeleting(false); }
  };

  const toggleVisible = async (t: VideoTutorial) => {
    try { await updateTutorial(t.id, { visible: !t.visible }); load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Tutoriales</h2>
          <p className="text-sm text-gray-500">Administre los videos tutoriales del portal</p>
        </div>
        <Button onClick={openCreate} className="bg-[#1A1A1A] hover:bg-[#1A1A1A]-light"><Plus className="w-4 h-4 mr-2" />Nuevo Tutorial</Button>
      </div>

      {error && <Card className="border-[#7A2A1E]/20 bg-[#7A2A1E]/5"><CardContent className="p-4"><p className="text-[#9E3A2E] text-sm">{error}</p></CardContent></Card>}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center"><p className="text-gray-400 text-sm">No hay tutoriales</p></div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead className="w-20 text-center">Vistas</TableHead>
                    <TableHead className="w-24 text-center">Visible</TableHead>
                    <TableHead className="w-28 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((t, i) => (
                    <motion.tr key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#1A1A1A]/5 flex items-center justify-center shrink-0"><Play className="w-3.5 h-3.5 text-[#1A1A1A]" /></div>
                          <span className="font-medium text-gray-900 truncate max-w-xs block">{t.title}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{t.category}</Badge></TableCell>
                      <TableCell className="text-sm text-gray-600">{t.duration}</TableCell>
                      <TableCell className="text-center"><div className="flex items-center justify-center gap-1"><Eye className="w-3.5 h-3.5 text-gray-400" /><span className="text-sm">{t.views}</span></div></TableCell>
                      <TableCell className="text-center"><Switch checked={t.visible} onCheckedChange={() => toggleVisible(t)} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#1A1A1A]" onClick={() => openEdit(t)}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#9E3A2E]" onClick={() => setDeleteId(t.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
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
            <DialogTitle>{editingId ? 'Editar Tutorial' : 'Nuevo Tutorial'}</DialogTitle>
            <DialogDescription>{editingId ? 'Modifique los datos del tutorial' : 'Complete los datos para crear un tutorial'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2"><Label>Título <span className="text-[#9E3A2E]">*</span></Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            <div className="space-y-2"><Label>URL del Video <span className="text-[#9E3A2E]">*</span></Label><Input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://youtube.com/..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <ImageUpload
                value={form.thumbnailUrl}
                onChange={(url) => setForm({ ...form, thumbnailUrl: url })}
                label="Miniatura"
                folder="tutorials"
              />
              <div className="space-y-2"><Label>Duración</Label><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="Ej: 5:30" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Categoría</Label>
                <select className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
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
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar tutorial?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-[#7A2A1E] hover:bg-[#7A2A1E]-light text-white">{deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
