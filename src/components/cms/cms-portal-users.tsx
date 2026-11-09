'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Edit2, Trash2, Loader2, Shield, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
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

// ─── Validation helpers mirroring backend Zod schema rules ─────────────────────
const EMAIL_REGEX = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const CUBAN_PHONE_REGEX = /^(?:\+53|5)[0-9]{7}$/;
// OWASP/BIPA password strength — must match PASSWORD_STRENGTH in cms-schemas.ts
function validatePassword(val: string): string | null {
  if (!val) return null;
  if (val.length < 8) return 'Mínimo 8 caracteres';
  if (!/[A-Z]/.test(val)) return 'Debe tener al menos una mayúscula';
  if (!/[0-9]/.test(val)) return 'Debe tener al menos un número';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(val)) return 'Debe tener al menos un carácter especial';
  return null;
}

interface PortalUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  _newPassword?: string;
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
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', phone: '', role: '' });
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [rolesLoading, setRolesLoading] = useState(true);
  const newUserRef = useRef(newUser);
  newUserRef.current = newUser;

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
    setRolesLoading(true);
    try {
      const res = await fetch('/api/cms/user-roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setRolesLoading(false);
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
    if (!editRole) errs.role = 'El rol es requerido';

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
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? 'Error al actualizar usuario');
      }
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async () => {
    // Client-side validation mirroring createPortalUserSchema
    const errs: Record<string, string> = {};
    if (!newUser.email.trim()) {
      errs.email = 'El email es requerido';
    } else if (!EMAIL_REGEX.test(newUser.email)) {
      errs.email = 'Email inválido';
    }
    const pwErr = validatePassword(newUser.password);
    if (pwErr) errs.password = pwErr;
    if (newUser.name && newUser.name.length < 2) {
      errs.name = 'El nombre debe tener al menos 2 caracteres';
    }
    if (newUser.phone && !CUBAN_PHONE_REGEX.test(newUser.phone)) {
      errs.phone = 'Teléfono cubano inválido (ej: +53 5XXXXXXX)';
    }
    if (!newUser.role) {
      errs.role = 'El rol es requerido';
    }
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setCreating(true);
    setFormErrors({});
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
        setNewUser({ email: '', password: '', name: '', phone: '', role: '' });
        await fetchUsers();
      } else {
        // Backend now returns { success, error, fields: [{field, message}] } on 400
        if (res.status === 400 && data.fields?.length) {
          const errMap: Record<string, string> = {};
          for (const f of data.fields as { field: string; message: string }[]) {
            errMap[f.field] = f.message;
          }
          setFormErrors(errMap);
        } else if (res.status === 409) {
          setFormErrors({ email: data.error || 'Ya existe un usuario con ese email' });
        } else {
          toast.error(data.error || 'Error al crear usuario');
        }
      }
    } catch {
      toast.error('Error de conexión. Intente nuevamente.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

    try {
      const res = await fetch(`/api/cms/portal-users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(formatCmsToast('Usuario', userEmail, 'eliminado'));
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
            placeholder="Buscar por email o nombre..."
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
                        {user.phone && <p className="text-xs text-gray-600">{user.phone}</p>}
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
                        onClick={() => handleDeleteUser(user.id, user.email)}
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
                <Input
                  value={selectedUser.email}
                  onChange={(e) => { setSelectedUser({ ...selectedUser, email: e.target.value }); clearError('email'); }}
                  onBlur={(e) => {
                    if (e.target.value.trim() && !EMAIL_REGEX.test(e.target.value)) {
                      setFieldErrors(p => ({ ...p, email: 'Email inválido' }));
                    }
                  }}
                />
                {fieldErrors.email && <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>}
              </div>
              <div>
                <Label>Nombre</Label>
                <Input
                  value={selectedUser.name || ''}
                  onChange={(e) => { setSelectedUser({ ...selectedUser, name: e.target.value }); clearError('name'); }}
                  onBlur={(e) => {
                    if (e.target.value.trim().length < 2) {
                      setFieldErrors(p => ({ ...p, name: 'El nombre debe tener al menos 2 caracteres' }));
                    }
                  }}
                />
                {fieldErrors.name && <p className="text-sm text-red-600 mt-1">{fieldErrors.name}</p>}
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input
                  value={selectedUser.phone || ''}
                  onChange={(e) => { setSelectedUser({ ...selectedUser, phone: e.target.value }); clearError('phone'); }}
                  onBlur={(e) => {
                    if (e.target.value.trim() && !CUBAN_PHONE_REGEX.test(e.target.value)) {
                      setFieldErrors(p => ({ ...p, phone: 'Teléfono cubano inválido' }));
                    }
                  }}
                />
                {fieldErrors.phone && <p className="text-sm text-red-600 mt-1">{fieldErrors.phone}</p>}
              </div>
              <div>
                <Label>Nueva Contraseña (dejar vacío para no cambiar)</Label>
                <PasswordInput
                  placeholder="••••••"
                  value=""
                  onChange={(v) => {
                    setSelectedUser({ ...selectedUser, _newPassword: v } as typeof selectedUser);
                    const err = validatePassword(v);
                    if (err) setFieldErrors(p => ({ ...p, password: err }));
                    else clearError('password');
                  }}
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      const err = validatePassword(e.target.value);
                      if (err) setFieldErrors(p => ({ ...p, password: err }));
                    }
                  }}
                />
                {fieldErrors.password && <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>}
              </div>
              <div>
                <Label htmlFor="edit-role">Rol</Label>
                <Select value={editRole} onValueChange={(val) => { setEditRole(val); clearError('role'); }} disabled={rolesLoading}>
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder={rolesLoading ? 'Cargando roles...' : 'Seleccionar rol'} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                    ))}
                    {!rolesLoading && roles.length === 0 && (
                      <SelectItem value="user" disabled>No hay roles disponibles</SelectItem>
                    )}
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
      <Dialog open={createDialogOpen} onOpenChange={(open) => { if (!open) { setCreating(false); setFormErrors({}); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear Usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }} className="space-y-4">
            {/* Email */}
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => { setNewUser({ ...newUser, email: e.target.value }); setFormErrors(p => { const n = { ...p }; delete n.email; return n; }); }}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (!val) setFormErrors(p => ({ ...p, email: 'El email es requerido' }));
                  else if (!EMAIL_REGEX.test(val)) setFormErrors(p => ({ ...p, email: 'Email inválido' }));
                }}
              />
              {formErrors.email && <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>}
            </div>
            {/* Password */}
            <div>
              <Label>Contraseña *</Label>
              <PasswordInput
                value={newUser.password}
                onChange={(v) => { setNewUser({ ...newUser, password: v }); setFormErrors(p => { const n = { ...p }; delete n.password; return n; }); }}
                onBlur={(e) => {
                  const err = validatePassword(e.target.value);
                  if (err) setFormErrors(p => ({ ...p, password: err }));
                }}
                placeholder="Mín. 8 chars, mayúscula, número, especial"
              />
              {formErrors.password && <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>}
            </div>
            {/* Name */}
            <div>
              <Label>Nombre</Label>
              <Input
                value={newUser.name}
                onChange={(e) => { setNewUser({ ...newUser, name: e.target.value }); setFormErrors(p => { const n = { ...p }; delete n.name; return n; }); }}
                onBlur={(e) => {
                  if (e.target.value.trim().length > 0 && e.target.value.trim().length < 2) {
                    setFormErrors(p => ({ ...p, name: 'El nombre debe tener al menos 2 caracteres' }));
                  }
                }}
              />
              {formErrors.name && <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>}
            </div>
            {/* Phone */}
            <div>
              <Label>Teléfono</Label>
              <Input
                value={newUser.phone}
                onChange={(e) => { setNewUser({ ...newUser, phone: e.target.value }); setFormErrors(p => { const n = { ...p }; delete n.phone; return n; }); }}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val && !CUBAN_PHONE_REGEX.test(val)) {
                    setFormErrors(p => ({ ...p, phone: 'Teléfono cubano inválido (ej: +53 5XXXXXXX)' }));
                  }
                }}
                placeholder="+53 5XXXXXXX"
              />
              {formErrors.phone && <p className="text-sm text-red-600 mt-1">{formErrors.phone}</p>}
            </div>
            {/* Role */}
            <div>
              <Label>Rol *</Label>
              <Select value={newUser.role} onValueChange={(val) => { setNewUser({ ...newUser, role: val }); setFormErrors(p => { const n = { ...p }; delete n.role; return n; }); }}>
                <SelectTrigger disabled={rolesLoading}>
                  <SelectValue placeholder={rolesLoading ? 'Cargando roles...' : 'Seleccionar rol'} />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                  ))}
                  {!rolesLoading && roles.length === 0 && (
                    <SelectItem value="user" disabled>No hay roles disponibles</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {formErrors.role && <p className="text-sm text-red-600 mt-1">{formErrors.role}</p>}
            </div>
            <Button
              type="submit"
              disabled={creating || !newUser.email || !newUser.password || !newUser.role || rolesLoading}
              className="w-full bg-[#005A9C] hover:bg-[#0074C8] text-white"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Crear Usuario
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
