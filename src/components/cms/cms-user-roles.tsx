'use client';

import React, { useState, useEffect } from 'react';
import { Save, Trash2, Plus, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AVAILABLE_PERMISSIONS = [
  'view_procedures',
  'create_procedure',
  'edit_procedure',
  'delete_procedure',
  'download_documents',
  'view_information_requests',
  'create_information_request',
  'respond_to_requests',
  'manage_subscriptions',
  'view_user_list',
  'edit_user_roles',
  'delete_users',
  'view_reports',
  'export_data',
];

interface UserRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export default function CmsUserRoles() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/cms/user-roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data.data || []);
      }
    } catch (error) {
      toast.error('Error al cargar roles');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setEditName(role.name);
    setEditDescription(role.description || '');
    setEditPermissions(role.permissions);
    setIsNew(false);
  };

  const handleNewRole = () => {
    setSelectedRole(null);
    setEditName('');
    setEditDescription('');
    setEditPermissions([]);
    setIsNew(true);
  };

  const handlePermissionToggle = (permission: string) => {
    setEditPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.error('El nombre del rol es requerido');
      return;
    }

    setSaving(true);
    try {
      const url = isNew
        ? '/api/cms/user-roles'
        : `/api/cms/user-roles/${selectedRole?.id}`;

      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          permissions: editPermissions,
        }),
      });

      if (res.ok) {
        toast.success(isNew ? 'Rol creado exitosamente' : 'Rol actualizado');
        await fetchRoles();
        setSelectedRole(null);
        setIsNew(false);
      } else {
        toast.error('Error al guardar el rol');
      }
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este rol?')) return;

    try {
      const res = await fetch(`/api/cms/user-roles/${roleId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('Rol eliminado');
        await fetchRoles();
        setSelectedRole(null);
      } else {
        toast.error('Error al eliminar el rol');
      }
    } catch (error) {
      toast.error('Error al eliminar');
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <Card>
          <CardHeader>
            <CardTitle>Roles del Sistema</CardTitle>
            <CardDescription>Gestiona los roles y permisos de usuarios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {roles.map(role => (
              <div
                key={role.id}
                onClick={() => handleSelectRole(role)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedRole?.id === role.id
                    ? 'bg-[#1A1A1A] text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <h3 className="font-semibold">{role.name}</h3>
                <p className={`text-sm ${selectedRole?.id === role.id ? 'text-gray-100' : 'text-gray-600'}`}>
                  {role.permissions.length} permisos
                </p>
              </div>
            ))}
            <Button
              onClick={handleNewRole}
              className="w-full bg-[#1A1A1A] hover:bg-[#1A1A1A]-light"
              variant="default"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Rol
            </Button>
          </CardContent>
        </Card>

        {/* Role Editor */}
        <div className="lg:col-span-2">
          {selectedRole || isNew ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isNew ? 'Crear Nuevo Rol' : `Editar: ${editName}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="roleName">Nombre del Rol</Label>
                  <Input
                    id="roleName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="ej: Operador"
                  />
                </div>

                <div>
                  <Label htmlFor="roleDesc">Descripción</Label>
                  <Input
                    id="roleDesc"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="ej: Operador de trámites"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-3">Permisos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AVAILABLE_PERMISSIONS.map(permission => (
                      <div key={permission} className="flex items-center gap-2">
                        <Checkbox
                          id={permission}
                          checked={editPermissions.includes(permission)}
                          onCheckedChange={() => handlePermissionToggle(permission)}
                        />
                        <Label
                          htmlFor={permission}
                          className="font-normal cursor-pointer text-sm"
                        >
                          {permission.replace(/_/g, ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 ml-2">
                    Los permisos aplicarán a todos los usuarios con este rol
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#1A1A1A] hover:bg-[#1A1A1A]-light flex-1"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Rol
                      </>
                    )}
                  </Button>
                  {!isNew && (
                    <Button
                      onClick={() => handleDelete(selectedRole!.id)}
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-gray-600">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>Selecciona un rol para editar o crea uno nuevo</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Permissions Reference */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Referencia de Permisos</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <div>
            <strong>view_procedures:</strong> Ver trámites
          </div>
          <div>
            <strong>create_procedure:</strong> Crear nuevos trámites
          </div>
          <div>
            <strong>edit_procedure:</strong> Editar trámites existentes
          </div>
          <div>
            <strong>download_documents:</strong> Descargar documentos
          </div>
          <div>
            <strong>respond_to_requests:</strong> Responder solicitudes de información
          </div>
        </CardContent>
      </Card>
    </div>
  );
}