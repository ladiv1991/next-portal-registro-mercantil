'use client';

import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Loader2, Shield, Mail, Phone, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/ui/password-input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCmsToast } from '@/lib/cms-helpers';

interface PortalUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  identityCard?: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export default function CmsPortalUsers() {
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<PortalUser | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', phone: '', identityCard: '', role: 'user' });
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [createErrors, setCreateErrors] = React.useState<Record<string, string>>({});

  const clearError = (field: string) => {
    setFieldErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/cms/portal-users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/cms/user-roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await fetchUsers();
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/cms/portal-users?search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      toast.error('Error en búsqueda');
    } finally {
      setSearching(false);
    }
  };

  const handleEditUser = (user: PortalUser) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditActive(user.isActive);
    setFieldErrors({});
    setDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    const errs: Record<string, string> = {};
    if (!editRole) errs.role = 'El rol es obligatorio';

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/cms/portal-users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: selectedUser.email,
          name: selectedUser.name || null,
          phone: selectedUser.phone || null,
          identityCard: selectedUser.identityCard || null,
          role: editRole,
          isActive: editActive,
          ...(selectedUser._newPassword ? { password: selectedUser._newPassword } : {}),
        }),
      });

      if (res.ok) {
        toast.success(formatCmsToast('Usuario', selectedUser?.email || '', 'actualizado'));
        setFieldErrors({});
        setDialogOpen(false);
        await fetchUsers();
      } else {
        toast.error('Error al actualizar usuario');
      }
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async () => {
    setCreating(true);
    setCreateErrors({});
    try {
      const res = await fetch('/api/cms/portal-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(formatCmsToast('Usuario', newUser.email, 'creado'));
        setCreateDialogOpen(false);
        setNewUser({ email: '', password: '', name: '', phone: '', identityCard: '', role: 'user' });
        await fetchUsers();
      } else {
        toast.error(data.error || 'Error al crear usuario');
      }
    } catch {
      toast.error('Error al crear usuario');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

    try {
      const res = await fetch(`/api/cms/portal-users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(formatCmsToast('Usuario', selectedUser?.email || '', 'eliminado'));
        await fetchUsers();
      } else {
        toast.error('Error al eliminar usuario');
      }
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'operator':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1A1A1A] mb-2">{users.length}</div>
              <p className="text-sm text-gray-600">Usuarios totales</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {users.filter(u => u.isVerified).length}
              </div>
              <p className="text-sm text-gray-600">Verificados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {users.filter(u => u.isActive).length}
              </div>
              <p className="text-sm text-gray-600">Activos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Usuarios</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Input
            placeholder="Buscar por email, nombre o carné..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            variant="outline"
            onClick={handleSearch}
            disabled={searching}
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-[#005A9C] hover:bg-[#0074C8] text-white ml-auto"
          >
            <Plus className="w-4 h-4 mr-1" /> Crear Usuario
          </Button>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Portal</CardTitle>
          <CardDescription>Gestiona usuarios, roles y permisos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Verificado</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{user.name || 'Sin nombre'}</p>
                        <p className="text-xs text-gray-600">{user.identityCard}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Activo</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.isVerified ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Nunca'}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={selectedUser.email} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} />
                {fieldErrors.email && <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>}
              </div>
              <div>
                <Label>Nombre</Label>
                <Input value={selectedUser.name || ''} onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })} />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input value={selectedUser.phone || ''} onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })} />
              </div>
              <div>
                <Label>Carné de Identidad</Label>
                <Input value={selectedUser.identityCard || ''} onChange={(e) => setSelectedUser({ ...selectedUser, identityCard: e.target.value })} />
              </div>
              <div>
                <Label>Nueva Contraseña (dejar vacío para no cambiar)</Label>
                <PasswordInput placeholder="••••••" onChange={(e) => setSelectedUser({ ...selectedUser, _newPassword: e.target.value } as typeof selectedUser)} />
              </div>
              <div>
                <Label htmlFor="edit-role">Rol</Label>
                <Select value={editRole} onValueChange={(val) => { setEditRole(val); clearError('role'); }}>
                  <SelectTrigger id="edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.role && <p className="text-sm text-red-600 mt-1">{fieldErrors.role}</p>}
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="edit-active" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} />
                <Label htmlFor="edit-active">Usuario activo</Label>
              </div>
              <Button onClick={handleSaveUser} disabled={saving} className="w-full bg-[#005A9C] hover:bg-[#0074C8] text-white">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Actualizar Usuario
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email *</Label>
              <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              {createErrors.email && <p className="text-sm text-red-600 mt-1">{createErrors.email}</p>}
            </div>
            <div>
              <Label>Contraseña *</Label>
              <PasswordInput value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
            </div>
            <div>
              <Label>Nombre</Label>
              <Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
            </div>
            <div>
              <Label>Carné de Identidad</Label>
              <Input value={newUser.identityCard} onChange={(e) => setNewUser({ ...newUser, identityCard: e.target.value })} />
            </div>
            <div>
              <Label>Rol</Label>
              <Select value={newUser.role} onValueChange={(val) => setNewUser({ ...newUser, role: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateUser} disabled={creating || !newUser.email || !newUser.password} className="w-full bg-[#005A9C] hover:bg-[#0074C8] text-white">
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Crear Usuario
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}