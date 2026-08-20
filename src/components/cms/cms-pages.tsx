'use client';

import React from 'react';
import { Plus, Pencil, Trash2, GripVertical, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Page } from './cms-types';
import { getPages, createPage, updatePage, deletePage } from './cms-api';

interface PageFormData {
  title: string;
  slug: string;
  description: string;
  visible: boolean;
  order: number;
}

const EMPTY_FORM: PageFormData = {
  title: '',
  slug: '',
  description: '',
  visible: true,
  order: 0,
};

export default function CmsPages() {
  const [pages, setPages] = React.useState<Page[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<PageFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = React.useState(false);

  // Delete state
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const loadPages = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPages(true);
      setPages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar páginas');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPages();
  }, [loadPages]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const handleOpenEdit = (page: Page) => {
    setEditingId(page.id);
    setForm({
      title: page.title,
      slug: page.slug,
      description: page.description || '',
      visible: page.visible,
      order: page.order,
    });
    setDialogOpen(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (title: string) => {
    setForm({
      ...form,
      title,
      slug: editingId ? form.slug : generateSlug(title),
    });
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('El título es obligatorio');
      return;
    }
    if (!form.slug.trim()) {
      toast.error('El slug es obligatorio');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        visible: form.visible,
        order: form.order,
      };

      if (editingId) {
        await updatePage(editingId, payload);
        toast.success('Página actualizada correctamente');
      } else {
        await createPage(payload);
        toast.success('Página creada correctamente');
      }

      setDialogOpen(false);
      loadPages();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar página');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await deletePage(deleteId);
      toast.success('Página eliminada correctamente');
      setDeleteId(null);
      loadPages();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar página');
    } finally {
      setDeleting(false);
    }
  };

  const toggleVisible = async (page: Page) => {
    try {
      await updatePage(page.id, { visible: !page.visible });
      toast.success(`Página ${!page.visible ? 'visible' : 'oculta'}`);
      loadPages();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar visibilidad');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Páginas</h2>
          <p className="text-sm text-gray-500">
            Administre las páginas del portal del Registro Mercantil
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[#1A1A1A] hover:bg-[#1A1A1A]-light">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Página
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-[#7A2A1E]/20 bg-[#7A2A1E]/5">
          <CardContent className="p-4">
            <p className="text-[#9E3A2E] text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : pages.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 text-sm">No hay datos</p>
              <p className="text-gray-400 text-xs mt-1">
                Cree una nueva página para comenzar
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="w-24 text-center">Bloques</TableHead>
                    <TableHead className="w-24 text-center">Visible</TableHead>
                    <TableHead className="w-28 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium text-gray-900">
                        {page.title}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                          /{page.slug}
                        </code>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-normal">
                          {page._count?.blocks ?? (page.blocks?.length ?? 0)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={page.visible}
                          onCheckedChange={() => toggleVisible(page)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-[#1A1A1A]"
                            onClick={() => handleOpenEdit(page)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-[#9E3A2E]"
                            onClick={() => setDeleteId(page.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Página' : 'Nueva Página'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Modifique los datos de la página'
                : 'Complete los datos para crear una nueva página'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="page-title">
                Título <span className="text-[#9E3A2E]">*</span>
              </Label>
              <Input
                id="page-title"
                placeholder="Ej: Portada, Consultas Públicas..."
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="page-slug">
                Slug <span className="text-[#9E3A2E]">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 shrink-0">/</span>
                <Input
                  id="page-slug"
                  placeholder="Ej: portada, consultas..."
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="page-description">Descripción</Label>
              <Textarea
                id="page-description"
                placeholder="Descripción breve de la página..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="page-order">Orden</Label>
              <Input
                id="page-order"
                type="number"
                min={0}
                value={form.order}
                onChange={(e) =>
                  setForm({ ...form, order: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <Label htmlFor="page-visible">Visible</Label>
              <Switch
                id="page-visible"
                checked={form.visible}
                onCheckedChange={(checked) => setForm({ ...form, visible: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#1A1A1A] hover:bg-[#1A1A1A]-light"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId ? 'Guardar Cambios' : 'Crear Página'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar página?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La página y todos sus bloques
              asociados serán eliminados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-[#7A2A1E] hover:bg-[#7A2A1E]-light text-white"
            >
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
