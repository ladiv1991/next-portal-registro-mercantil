'use client';

import React from 'react';
import { Plus, Pencil, Trash2, Loader2, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
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
import type { Statistic } from './cms-types';
import { getStatistics, createStatistic, updateStatistic, deleteStatistic } from './cms-api';

interface FormData {
  label: string; value: number; suffix: string; icon: string; order: number; visible: boolean;
}

const EMPTY: FormData = { label: '', value: 0, suffix: '', icon: 'BarChart3', order: 0, visible: true };

export default function CmsStatistics() {
  const [items, setItems] = React.useState<Statistic[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormData>(EMPTY);
  const [submitting, setSubmitting] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    try { setLoading(true); setError(null); setItems(await getStatistics()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Error al cargar estadísticas'); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (s: Statistic) => {
    setEditingId(s.id);
    setForm({ label: s.label, value: s.value, suffix: s.suffix || '', icon: s.icon, order: s.order, visible: s.visible });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.label.trim()) { toast.error('La etiqueta es obligatoria'); return; }
    try {
      setSubmitting(true);
      const payload = { label: form.label.trim(), value: form.value, suffix: form.suffix.trim() || undefined, icon: form.icon.trim() || 'BarChart3', order: form.order, visible: form.visible };
      if (editingId) { await updateStatistic(editingId, payload); toast.success('Estadística actualizada'); }
      else { await createStatistic(payload); toast.success('Estadística creada'); }
      setDialogOpen(false); load();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error al guardar'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { setDeleting(true); await deleteStatistic(deleteId); toast.success('Estadística eliminada'); setDeleteId(null); load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error al eliminar'); }
    finally { setDeleting(false); }
  };

  const toggleVisible = async (s: Statistic) => {
    try { await updateStatistic(s.id, { visible: !s.visible }); load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Estadísticas del Portal</h2>
          <p className="text-sm text-gray-500">Administre las cifras estadísticas mostradas</p>
        </div>
        <Button onClick={openCreate} className="bg-[#1A1A1A] hover:bg-[#1A1A1A]-light"><Plus className="w-4 h-4 mr-2" />Nueva Estadística</Button>
      </div>

      {error && <Card className="border-[#7A2A1E]/20 bg-[#7A2A1E]/5"><CardContent className="p-4"><p className="text-[#9E3A2E] text-sm">{error}</p></CardContent></Card>}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center"><p className="text-gray-400 text-sm">No hay estadísticas</p></div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Etiqueta</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Sufijo</TableHead>
                    <TableHead>Icono</TableHead>
                    <TableHead className="w-24 text-center">Visible</TableHead>
                    <TableHead className="w-28 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((s, i) => (
                    <motion.tr key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium text-gray-900">{s.label}</TableCell>
                      <TableCell><span className="text-lg font-bold text-[#1A1A1A]">{s.value.toLocaleString()}</span></TableCell>
                      <TableCell className="text-sm text-gray-500">{s.suffix || '—'}</TableCell>
                      <TableCell><code className="text-xs bg-gray-100 px-2 py-1 rounded">{s.icon}</code></TableCell>
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
            <DialogTitle>{editingId ? 'Editar Estadística' : 'Nueva Estadística'}</DialogTitle>
            <DialogDescription>{editingId ? 'Modifique los datos' : 'Agregue una nueva estadística'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Etiqueta <span className="text-[#9E3A2E]">*</span></Label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Ej: Sociedades Registradas" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Valor <span className="text-[#9E3A2E]">*</span></Label><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Sufijo</Label><Input value={form.suffix} onChange={(e) => setForm({ ...form, suffix: e.target.value })} placeholder="Ej: +" /></div>
              <div className="space-y-2"><Label>Icono</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
            </div>
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
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar estadística?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-[#7A2A1E] hover:bg-[#7A2A1E]-light text-white">{deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
