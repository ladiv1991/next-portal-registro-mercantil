'use client';

import React from 'react';
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import type { MenuItem } from './cms-types';
import { getMenus, createMenu, updateMenu, deleteMenu } from './cms-api';

interface MenuFormData {
  label: string;
  icon: string;
  sectionId: string;
  order: number;
  visible: boolean;
}

const EMPTY_FORM: MenuFormData = {
  label: '',
  icon: '',
  sectionId: '',
  order: 0,
  visible: true,
};

export default function CmsMenus() {
  const [menus, setMenus] = React.useState<MenuItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<MenuFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = React.useState(false);

  // Delete state
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const loadMenus = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMenus();
      setMenus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar menús');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const handleOpenEdit = (menu: MenuItem) => {
    setEditingId(menu.id);
    setForm({
      label: menu.label,
      icon: menu.icon || '',
      sectionId: menu.sectionId || '',
      order: menu.order,
      visible: menu.visible,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.label.trim()) {
      toast.error('La etiqueta es obligatoria');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        label: form.label.trim(),
        icon: form.icon.trim() || null,
        sectionId: form.sectionId.trim() || null,
        order: form.order,
        visible: form.visible,
      };

      if (editingId) {
        await updateMenu(editingId, payload);
        toast.success('Menú actualizado correctamente');
      } else {
        await createMenu(payload);
        toast.success('Menú creado correctamente');
      }

      setDialogOpen(false);
      loadMenus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar menú');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await deleteMenu(deleteId);
      toast.success('Menú eliminado correctamente');
      setDeleteId(null);
      loadMenus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar menú');
    } finally {
      setDeleting(false);
    }
  };

  const toggleVisible = async (menu: MenuItem) => {
    try {
      await updateMenu(menu.id, { visible: !menu.visible });
      toast.success(`Menú ${!menu.visible ? 'visible' : 'oculto'}`);
      loadMenus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar visibilidad');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Menús</h2>
          <p className="text-sm text-gray-500">
            Administre los elementos de navegación del portal
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[#1A1A1A] hover:bg-[#1A1A1A]-light">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Menú
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
          ) : menus.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 text-sm">No hay datos</p>
              <p className="text-gray-400 text-xs mt-1">
                Cree un nuevo menú para comenzar
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Orden</TableHead>
                    <TableHead>Etiqueta</TableHead>
                    <TableHead>Icono</TableHead>
                    <TableHead>Sección ID</TableHead>
                    <TableHead className="w-24 text-center">Visible</TableHead>
                    <TableHead className="w-28 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menus.map((menu) => (
                    <TableRow key={menu.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-3.5 h-3.5 text-gray-300" />
                          <span className="text-sm text-gray-600">{menu.order}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {menu.label}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {menu.icon || '—'}
                        </code>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {menu.sectionId || '—'}
                        </code>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={menu.visible}
                          onCheckedChange={() => toggleVisible(menu)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-[#1A1A1A]"
                            onClick={() => handleOpenEdit(menu)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-[#9E3A2E]"
                            onClick={() => setDeleteId(menu.id)}
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
              {editingId ? 'Editar Menú' : 'Nuevo Menú'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Modifique los datos del elemento de menú'
                : 'Complete los datos para crear un nuevo elemento de menú'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="menu-label">
                Etiqueta <span className="text-[#9E3A2E]">*</span>
              </Label>
              <Input
                id="menu-label"
                placeholder="Ej: Portada, Consultas..."
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="menu-icon">Icono</Label>
              <Input
                id="menu-icon"
                placeholder="Ej: Landmark, Search..."
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="menu-sectionId">Sección ID</Label>
              <Input
                id="menu-sectionId"
                placeholder="Ej: home, consultas..."
                value={form.sectionId}
                onChange={(e) => setForm({ ...form, sectionId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="menu-order">Orden</Label>
              <Input
                id="menu-order"
                type="number"
                min={0}
                value={form.order}
                onChange={(e) =>
                  setForm({ ...form, order: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <Label htmlFor="menu-visible">Visible</Label>
              <Switch
                id="menu-visible"
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
              {editingId ? 'Guardar Cambios' : 'Crear Menú'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar menú?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El elemento de menú será eliminado
              permanentemente del sistema.
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
