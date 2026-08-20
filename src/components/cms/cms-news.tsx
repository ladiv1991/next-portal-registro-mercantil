'use client';

import React from 'react';
import { Plus, Pencil, Trash2, Loader2, Newspaper, Star } from 'lucide-react';
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
import type { NewsArticle } from './cms-types';
import { getNewsArticles, createNewsArticle, updateNewsArticle, deleteNewsArticle } from './cms-api';
import { ImageUpload } from './CmsFileUpload';

interface FormData {
  title: string; summary: string; content: string; category: string;
  imageUrl: string; source: string; published: boolean; publishedAt: string;
  featured: boolean; order: number;
}

const EMPTY: FormData = { title: '', summary: '', content: '', category: 'General', imageUrl: '', source: '', published: false, publishedAt: '', featured: false, order: 0 };
const CATEGORIES = ['General', 'Constitución', 'Modificación', 'Inversión Extranjera (VUCE)', 'Legislación', 'Eventos', 'Servicios'];

export default function CmsNews() {
  const [items, setItems] = React.useState<NewsArticle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormData>(EMPTY);
  const [submitting, setSubmitting] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    try { setLoading(true); setError(null); setItems(await getNewsArticles()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Error al cargar noticias'); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (n: NewsArticle) => {
    setEditingId(n.id);
    setForm({ title: n.title, summary: n.summary, content: n.content, category: n.category, imageUrl: n.imageUrl || '', source: n.source || '', published: n.published, publishedAt: n.publishedAt || '', featured: n.featured, order: n.order });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return; }
    try {
      setSubmitting(true);
      const payload = { title: form.title.trim(), summary: form.summary.trim(), content: form.content.trim(), category: form.category, imageUrl: form.imageUrl.trim() || undefined, source: form.source.trim() || undefined, published: form.published, publishedAt: form.publishedAt || undefined, featured: form.featured, order: form.order };
      if (editingId) { await updateNewsArticle(editingId, payload); toast.success('Noticia actualizada'); }
      else { await createNewsArticle(payload); toast.success('Noticia creada'); }
      setDialogOpen(false); load();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error al guardar'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { setDeleting(true); await deleteNewsArticle(deleteId); toast.success('Noticia eliminada'); setDeleteId(null); load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error al eliminar'); }
    finally { setDeleting(false); }
  };

  const togglePublished = async (n: NewsArticle) => {
    try { await updateNewsArticle(n.id, { published: !n.published }); load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Noticias</h2>
          <p className="text-sm text-gray-500">Administre las noticias y publicaciones del portal</p>
        </div>
        <Button onClick={openCreate} className="bg-[#1A1A1A] hover:bg-[#1A1A1A]-light"><Plus className="w-4 h-4 mr-2" />Nueva Noticia</Button>
      </div>

      {error && <Card className="border-[#7A2A1E]/20 bg-[#7A2A1E]/5"><CardContent className="p-4"><p className="text-[#9E3A2E] text-sm">{error}</p></CardContent></Card>}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center"><p className="text-gray-400 text-sm">No hay noticias</p></div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="w-24 text-center">Estado</TableHead>
                    <TableHead className="w-20 text-center">Destacada</TableHead>
                    <TableHead className="w-28 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((n, i) => (
                    <motion.tr key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Newspaper className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="font-medium text-gray-900 truncate max-w-xs block">{n.title}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{n.category}</Badge></TableCell>
                      <TableCell className="text-center">
                        <Badge variant={n.published ? 'default' : 'secondary'} className={n.published ? 'bg-green-100 text-green-700' : ''}>
                          {n.published ? 'Publicada' : 'Borrador'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{n.featured && <Star className="w-4 h-4 text-[#9E3A2E] mx-auto" />}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#1A1A1A]" onClick={() => openEdit(n)}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#9E3A2E]" onClick={() => setDeleteId(n.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Noticia' : 'Nueva Noticia'}</DialogTitle>
            <DialogDescription>{editingId ? 'Modifique los datos de la noticia' : 'Complete los datos para crear una noticia'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2"><Label>Título <span className="text-[#9E3A2E]">*</span></Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Resumen</Label><Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} /></div>
            <div className="space-y-2"><Label>Contenido</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Categoría</Label>
                <select className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label>Fuente</Label><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></div>
            </div>
            <ImageUpload
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
              label="Imagen de la Noticia"
              folder="news"
            />
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Fecha Publicación</Label><Input type="date" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} /></div>
              <div className="space-y-2"><Label>Orden</Label><Input type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} /></div>
              <div className="flex flex-col gap-3 pt-5">
                <div className="flex items-center justify-between"><Label className="text-xs">Publicada</Label><Switch checked={form.published} onCheckedChange={(c) => setForm({ ...form, published: c })} /></div>
                <div className="flex items-center justify-between"><Label className="text-xs">Destacada</Label><Switch checked={form.featured} onCheckedChange={(c) => setForm({ ...form, featured: c })} /></div>
              </div>
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
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar noticia?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-[#7A2A1E] hover:bg-[#7A2A1E]-light text-white">{deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
