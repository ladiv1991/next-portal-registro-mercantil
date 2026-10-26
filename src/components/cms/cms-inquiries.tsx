'use client';

import React from 'react';
import { Loader2, Mail, Eye, MessageSquareReply, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface Inquiry {
  id: string;
  name: string | null;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  new: { label: 'Nuevo', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  read: { label: 'Leído', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  replied: { label: 'Respondido', className: 'bg-green-100 text-green-800 border-green-200' },
  closed: { label: 'Cerrado', className: 'bg-gray-50 text-gray-400 border-gray-100' },
};

const ACTIONS = [
  { status: 'read', label: 'Marcar leído', icon: Eye },
  { status: 'replied', label: 'Respondido', icon: MessageSquareReply },
  { status: 'closed', label: 'Cerrar', icon: Archive },
];

export default function CmsInquiries() {
  const [items, setItems] = React.useState<Inquiry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cms/inquiries', { credentials: 'include' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Error al cargar');
      setItems(json.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al cargar consultas');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/cms/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Error al actualizar');
      setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
      toast.success(`Estado actualizado a ${STATUS_CONFIG[status]?.label || status}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al actualizar estado');
    } finally {
      setUpdatingId(null);
    }
  };

  const truncate = (text: string, max: number) =>
    text.length > max ? text.slice(0, max) + '…' : text;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Consultas Mesa de Ayuda</h2>
        <p className="text-sm text-gray-500">Envíos del formulario de contacto del portal público</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No hay consultas aún</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Asunto</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => {
                  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.new;
                  return (
                    <TableRow key={item.id} className="hover:bg-gray-50/50">
                      <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString('es-CU', {
                          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-900">
                        {item.email}
                        {item.name && <span className="block text-xs text-gray-400 font-normal">{item.name}</span>}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700 max-w-[200px] truncate">
                        {item.subject}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 max-w-[300px]" title={item.message}>
                        {truncate(item.message, 80)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {ACTIONS.filter(a => a.status !== item.status).map(action => {
                            const Icon = action.icon;
                            const isUpdating = updatingId === item.id;
                            return (
                              <Button
                                key={action.status}
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-gray-500 hover:text-[var(--rm-primary)]"
                                disabled={isUpdating}
                                onClick={() => updateStatus(item.id, action.status)}
                                title={action.label}
                              >
                                {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
                              </Button>
                            );
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}