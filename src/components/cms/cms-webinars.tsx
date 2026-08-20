'use client';

import React from 'react';
import { Plus, Pencil, Trash2, Loader2, Calendar } from 'lucide-react';
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
import type { Webinar } from './cms-types';
import { getWebinars, createWebinar, updateWebinar, deleteWebinar } from './cms-api';

interface FormData {
  title: string; description: string; date: string; time: string;
  location: string; status: string; maxAttendees: number; order: number; visible: boolean;
}

const EMPTY: FormData = { title: '', description: '', date: '', time: '', location: '', status: 'programado', maxAttendees: 100, order: 0, visible: true };
const STATUSES = ['programado', 'en_curso', 'finalizado', 'cancelado'];
const STATUS_LABELS: Record<string, string> = { programado: 'Programado', en_curso: 'En Curso', finalizado: 'Finalizado', cancelado: 'Cancelado' };

export default function CmsWebinars() {
  const [items, setItems] = React.useState<Webinar[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormData>(EMPTY);
  const [submitting, setSubmitting] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    try { setLoading(true); setError(null); setItems(await getWebinars()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Error al cargar webinars'); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (w: Webinar) => {
    setEditingId(w.id);
    setForm({ title: w.title, description: w.description, date: w.date, time: w.time, location: w.location || '', status: w.status, maxAttendees: w.maxAttendees || 100, order: w.order, visible: w.visible });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return; }
    try {
      setSubmitting(true);
      const payload = { title: form.title.trim(), description: form.description.trim(), date: form.date, time: form.time, location: form.location.trim() || undefined, status: form.status, maxAttendees: form.maxAttendees, order: form.order, visible: form.visible };
      if (editingId) { await updateWebinar(editingId, payload); toast.success('Webinar actualizado'); }
      else { await createWebinar(payload); toast.success('Webinar creado'); }
      setDialogOpen(false); load();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error al guardar'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { setDeleting(true); await deleteWebinar(deleteId); toast.success('Webinar eliminado'); setDeleteId(null); load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error al eliminar'); }
    finally { setDeleting(false); }
  };

  const toggleVisible = async (w: Webinar) => {
    try { await updateWebinar(w.id, { visible: !w.visible }); load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'programado': return 'bg-blue-100 text-blue-700';
      case 'en_curso': return 'bg-[#7A2A1E]/10 text-[#9E3A2E]';
      case 'finalizado': return 'bg-green-100 text-green-700';
      case 'cancelado': return 'bg-[#7A2A1E]/10 text-[#9E3A2E]';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Webinars</h2>
          <p className="text-sm text-gray-500">Administre los webinars y sesiones virtuales</p>
        </div>
        <Button onClick={openCreate} className="bg-[#1A1A1A] hover:bg-[#1A1A1A]-light"><Plus className="w-4 h-4 mr-2" />Nuevo Webinar</Button>
      </div>

      {error && <Card className="border-[#7A2A1E]/20 bg-[#7A2A1E]/5"><CardContent className="p-4"><p className="text-[#9E3A2E] text-sm">{error}</p></CardContent></Card>}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center"><p className="text-gray-400 text-sm">No hay webinars</p></div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-24 text-center">Visible</TableHead>
                    <TableHead className="w-28 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((w, i) => (
                    <motion.tr key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium text-gray-900">{w.title}</TableCell>
                      <TableCell><div className="flex items-center gap-1 text-sm text-gray-600"><Calendar className="w-3.5 h-3.5" />{w.date}</div></TableCell>
                      <TableCell className="text-sm text-gray-600">{w.time}</TableCell>
                      <TableCell><Badge className={statusColor(w.status)}>{STATUS_LABELS[w.status] || w.status}</Badge></TableCell>
                      <TableCell className="text-center"><Switch checked={w.visible} onCheckedChange={() => toggleVisible(w)} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#1A1A1A]" onClick={() => openEdit(w)}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#9E3A2E]" onClick={() => setDeleteId(w.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
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
            <DialogTitle>{editingId ? 'Editar Webinar' : 'Nuevo Webinar'}</DialogTitle>
            <DialogDescription>{editingId ? 'Modifique los datos del webinar' : 'Complete los datos para crear un webinar'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2"><Label>Título <span className="text-[#9E3A2E]">*</span></Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Fecha <span className="text-[#9E3A2E]">*</span></Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Hora <span className="text-[#9E3A2E]">*</span></Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Ubicación</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Presencial / Virtual" /></div>
              <div className="space-y-2"><Label>Estado</Label>
                <select className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Max. Asistentes</Label><Input type="number" min={1} value={form.maxAttendees} onChange={(e) => setForm({ ...form, maxAttendees: parseInt(e.target.value) || 1 })} /></div>
              <div className="space-y-2"><Label>Orden</Label><Input type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} /></div>
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
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar webinar?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-[#7A2A1E] hover:bg-[#7A2A1E]-light text-white">{deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
