'use client';

import React from 'react';
import { Plus, Pencil, Trash2, GripVertical, Loader2, Filter } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import type { Block, Page } from './cms-types';
import { BLOCK_TYPES } from './cms-types';
import { getBlocks, createBlock, updateBlock, deleteBlock, getPages } from './cms-api';
import JsonFieldEditor from './JsonFieldEditor';

interface BlockFormData {
  pageId: string;
  type: string;
  title: string;
  content: string;
  order: number;
  visible: boolean;
}

const EMPTY_FORM: BlockFormData = {
  pageId: '',
  type: '',
  title: '',
  content: '',
  order: 0,
  visible: true,
};

export default function CmsBlocks() {
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [pages, setPages] = React.useState<Page[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = React.useState<string>('all');

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<BlockFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = React.useState(false);

  // Delete state
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const loadPages = React.useCallback(async () => {
    try {
      const data = await getPages();
      setPages(data);
    } catch {
      // Pages may fail silently if only blocks needed
    }
  }, []);

  const loadBlocks = React.useCallback(async (pageId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBlocks(pageId && pageId !== 'all' ? pageId : undefined);
      setBlocks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar bloques');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPages();
    loadBlocks();
  }, [loadPages, loadBlocks]);

  const handlePageFilter = (pageId: string) => {
    setSelectedPageId(pageId);
    loadBlocks(pageId);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, pageId: selectedPageId !== 'all' ? selectedPageId : '' });
    setDialogOpen(true);
  };

  const handleOpenEdit = (block: Block) => {
    setEditingId(block.id);
    setForm({
      pageId: block.pageId,
      type: block.type,
      title: block.title || '',
      content: block.content,
      order: block.order,
      visible: block.visible,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.pageId) {
      toast.error('Seleccione una página');
      return;
    }
    if (!form.type) {
      toast.error('Seleccione un tipo de bloque');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        pageId: form.pageId,
        type: form.type,
        title: form.title.trim() || null,
        content: form.content,
        order: form.order,
        visible: form.visible,
      };

      if (editingId) {
        await updateBlock(editingId, payload);
        toast.success('Bloque actualizado correctamente');
      } else {
        await createBlock(payload);
        toast.success('Bloque creado correctamente');
      }

      setDialogOpen(false);
      loadBlocks(selectedPageId !== 'all' ? selectedPageId : undefined);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar bloque');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await deleteBlock(deleteId);
      toast.success('Bloque eliminado correctamente');
      setDeleteId(null);
      loadBlocks(selectedPageId !== 'all' ? selectedPageId : undefined);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar bloque');
    } finally {
      setDeleting(false);
    }
  };

  const toggleVisible = async (block: Block) => {
    try {
      await updateBlock(block.id, { visible: !block.visible });
      toast.success(`Bloque ${!block.visible ? 'visible' : 'oculto'}`);
      loadBlocks(selectedPageId !== 'all' ? selectedPageId : undefined);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar visibilidad');
    }
  };

  const getPageTitle = (pageId: string) => {
    const page = pages.find((p) => p.id === pageId);
    return page?.title || pageId;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Bloques</h2>
          <p className="text-sm text-gray-500">
            Administre los bloques de contenido de cada página
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[#1A1A1A] hover:bg-[#1A1A1A]-light">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Bloque
        </Button>
      </div>

      {/* Page Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <Label className="shrink-0 text-sm text-gray-600">Filtrar por página:</Label>
            <Select value={selectedPageId} onValueChange={handlePageFilter}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Todas las páginas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las páginas</SelectItem>
                {pages.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    {page.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : blocks.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 text-sm">No hay datos</p>
              <p className="text-gray-400 text-xs mt-1">
                {selectedPageId !== 'all'
                  ? 'No hay bloques en esta página. Cree uno nuevo.'
                  : 'Cree un nuevo bloque para comenzar'}
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Tipo</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Página</TableHead>
                    <TableHead className="w-16">Orden</TableHead>
                    <TableHead className="w-24 text-center">Visible</TableHead>
                    <TableHead className="w-28 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blocks.map((block) => (
                    <TableRow key={block.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <Badge variant="outline" className="font-normal text-xs">
                          {block.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {block.title || (
                          <span className="text-gray-400 italic">Sin título</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {getPageTitle(block.pageId)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{block.order}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={block.visible}
                          onCheckedChange={() => toggleVisible(block)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-[#1A1A1A]"
                            onClick={() => handleOpenEdit(block)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-[#9E3A2E]"
                            onClick={() => setDeleteId(block.id)}
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
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Bloque' : 'Nuevo Bloque'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Modifique los datos del bloque de contenido'
                : 'Complete los datos para crear un nuevo bloque de contenido'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Page Select */}
            <div className="space-y-2">
              <Label htmlFor="block-pageId">Página</Label>
              <Select
                value={form.pageId}
                onValueChange={(value) => setForm({ ...form, pageId: value })}
              >
                <SelectTrigger id="block-pageId">
                  <SelectValue placeholder="Seleccione una página" />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Select */}
            <div className="space-y-2">
              <Label htmlFor="block-type">Tipo de Bloque</Label>
              <Select
                value={form.type}
                onValueChange={(value) => setForm({ ...form, type: value })}
              >
                <SelectTrigger id="block-type">
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="block-title">Título</Label>
              <Input
                id="block-title"
                placeholder="Título del bloque (opcional)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            {/* Content */}
            <JsonFieldEditor
              value={form.content}
              onChange={(val) => setForm({ ...form, content: val })}
            />

            {/* Order */}
            <div className="space-y-2">
              <Label htmlFor="block-order">Orden</Label>
              <Input
                id="block-order"
                type="number"
                min={0}
                value={form.order}
                onChange={(e) =>
                  setForm({ ...form, order: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            {/* Visible */}
            <div className="flex items-center justify-between py-1">
              <Label htmlFor="block-visible">Visible</Label>
              <Switch
                id="block-visible"
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
              {editingId ? 'Guardar Cambios' : 'Crear Bloque'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar bloque?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El bloque de contenido será
              eliminado permanentemente del sistema.
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
