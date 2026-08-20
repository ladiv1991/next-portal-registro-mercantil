'use client';

import React from 'react';
import { Plus, Pencil, Trash2, Loader2, BookOpen } from 'lucide-react';
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
import type { Guide } from './cms-types';
import { getGuides, createGuide, updateGuide, deleteGuide } from './cms-api';
import GuideStepsEditor from './GuideStepsEditor';

interface FormData {
  title: string;
  description: string;
  icon: string;
  steps: string;
  order: number;
  visible: boolean;
}

const EMPTY: FormData = { title: '', description: '', icon: 'BookOpen', steps: '[]', order: 0, visible: true };

const ICONS = ['BookOpen', 'Building2', 'PenTool', 'FileSpreadsheet', 'Globe2', 'FileText', 'Briefcase', 'ClipboardList', 'Scale', 'Shield', 'Users', 'CheckCircle'];

export default function CmsGuides() {
  const [items, setItems] = React.useState<Guide[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormData>(EMPTY);
  const [submitting, setSubmitting] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    try { setLoading(true); setError(null); setItems(await getGuides()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Error al cargar guías'); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY);
    setDialogOpen(true);
  };

  const openEdit = (g: Guide) => {
    setEditingId(g.id);
    setForm({ title: g.title, description: g.description, icon: g.icon, steps: g.steps, order: g.order, visible: g.visible });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return; }
    try {
      setSubmitting(true);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        icon: form.icon,
        steps: form.steps,
        order: form.order,
        visible: form.visible,
      };
      if (editingId) { await updateGuide(editingId, payload); toast.success('Guía actualizada'); }
      else { await createGuide(payload); toast.success('Guía creada'); }
      setDialogOpen(false);
      load();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error al guardar'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { setDeleting(true); await deleteGuide(deleteId); toast.success('Guía eliminada'); setDeleteId(null); load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error al eliminar'); }
    finally { setDeleting(false); }
  };

  const toggleVisible = async (g: Guide) => {
    try {
      await updateGuide(g.id, { visible: !g.visible });
      setItems(items.map(i => i.id === g.id ? { ...i, visible: !i.visible } : i));
      toast.success(g.visible ? 'Guía ocultada' : 'Guía visible');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error al actualizar'); }
  };

  const parseStepsCount = (stepsStr: string): number => {
    try { return JSON.parse(stepsStr || '[]').length; } catch { return 0; }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-destructive">
        <p>Error: {error}</p>
        <Button variant="outline" onClick={load} className="mt-4">Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#9E3A2E]" />
            Guías Paso a Paso
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Gestione las guías de ayuda para los usuarios del portal</p>
        </div>
        <Button onClick={openCreate} className="bg-[#7A2A1E] hover:bg-[#7A2A1E]-dark text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Guía
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/5">
                <TableHead className="font-semibold text-[#1A1A1A]">Título</TableHead>
                <TableHead className="font-semibold text-[#1A1A1A]">Icono</TableHead>
                <TableHead className="font-semibold text-[#1A1A1A]">Pasos</TableHead>
                <TableHead className="font-semibold text-[#1A1A1A]">Orden</TableHead>
                <TableHead className="font-semibold text-[#1A1A1A]">Estado</TableHead>
                <TableHead className="font-semibold text-[#1A1A1A] w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hay guías creadas. Haga clic en &quot;Nueva Guía&quot; para comenzar.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((g) => (
                  <TableRow key={g.id} className="group">
                    <TableCell>
                      <div>
                        <p className="font-medium text-[#1A1A1A]">{g.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[300px]">{g.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{g.icon}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{parseStepsCount(g.steps)} pasos</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{g.order}</TableCell>
                    <TableCell>
                      <Switch checked={g.visible} onCheckedChange={() => toggleVisible(g)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(g)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(g.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Guía' : 'Nueva Guía'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Modifique los datos de la guía' : 'Complete los datos para crear una nueva guía paso a paso'}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guide-title">Título *</Label>
                  <Input id="guide-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Guía de Constitución de SRL" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guide-icon">Icono</Label>
                  <select
                    id="guide-icon"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {ICONS.map(ic => (
                      <option key={ic} value={ic}>{ic}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guide-description">Descripción</Label>
                <Textarea id="guide-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción general de la guía..." rows={2} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guide-order">Orden</Label>
                  <Input id="guide-order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={form.visible} onCheckedChange={(v) => setForm({ ...form, visible: v })} />
                  <Label>Visible</Label>
                </div>
              </div>

              {/* Steps Editor */}
              <GuideStepsEditor
                value={form.steps}
                onChange={(val) => setForm({ ...form, steps: val })}
              />
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-[#7A2A1E] hover:bg-[#7A2A1E]-dark text-white">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editingId ? 'Guardar Cambios' : 'Crear Guía'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Guía</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea eliminar esta guía? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-white hover:bg-destructive/90">
              {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
