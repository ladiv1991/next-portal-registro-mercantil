'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, CheckCircle2, Clock, AlertCircle,
  Download, Plus, User, LogOut, Bell, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';

interface UserProcedure {
  id: string;
  title: string;
  type: string;
  status: string;
  referenceNumber?: string;
  requestDate: string;
  completedDate?: string;
  documents?: string[];
}

interface InformationRequest {
  id: string;
  subject: string;
  status: string;
  message: string;
  response?: string;
  createdAt: string;
  respondedAt?: string;
}

interface DashboardUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  identityCard?: string;
  role: string;
}

export default function PortalDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [procedures, setProcedures] = useState<UserProcedure[]>([]);
  const [requests, setRequests] = useState<InformationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProcedures: 0,
    completedProcedures: 0,
    pendingProcedures: 0,
    pendingRequests: 0,
  });

  useEffect(() => {
    fetchUserData();
    fetchProcedures();
    fetchRequests();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/portal/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        router.push('/auth/enzona');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      router.push('/auth/enzona');
    }
  };

  const fetchProcedures = async () => {
    try {
      const res = await fetch('/api/portal/user/procedures');
      if (res.ok) {
        const data = await res.json();
        setProcedures(data.procedures || []);
        
        // Calcular estadísticas
        const completed = data.procedures?.filter((p: UserProcedure) => p.status === 'completed').length || 0;
        const pending = data.procedures?.filter((p: UserProcedure) => p.status === 'pending' || p.status === 'processing').length || 0;
        
        setStats(prev => ({
          ...prev,
          totalProcedures: data.procedures?.length || 0,
          completedProcedures: completed,
          pendingProcedures: pending,
        }));
      }
    } catch (error) {
      console.error('Error fetching procedures:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/portal/user/information-requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
        
        const pending = data.requests?.filter((r: InformationRequest) => r.status === 'pending').length || 0;
        setStats(prev => ({
          ...prev,
          pendingRequests: pending,
        }));
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/portal/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A1A1A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text-primary">Dashboard</h1>
              <p className="text-sm text-gray-600">Bienvenido, {user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#1A1A1A] mb-2">
                    {stats.totalProcedures}
                  </div>
                  <p className="text-sm text-gray-600">Trámites totales</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {stats.completedProcedures}
                  </div>
                  <p className="text-sm text-gray-600">Completados</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {stats.pendingProcedures}
                  </div>
                  <p className="text-sm text-gray-600">En proceso</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {stats.pendingRequests}
                  </div>
                  <p className="text-sm text-gray-600">Consultas pendientes</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="procedures" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="procedures">Mis Trámites</TabsTrigger>
            <TabsTrigger value="requests">
              Consultas
              {stats.pendingRequests > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {stats.pendingRequests}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Procedures Tab */}
          <TabsContent value="procedures" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Mis Trámites</h2>
              <Button className="bg-[#1A1A1A] hover:bg-[#1A1A1A]-light">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Trámite
              </Button>
            </div>

            <div className="space-y-3">
              {procedures.length > 0 ? (
                procedures.map((proc) => (
                  <Card key={proc.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <h3 className="font-semibold text-[#1A1A1A]">{proc.title}</h3>
                            <Badge className={getStatusColor(proc.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(proc.status)}
                                <span>{proc.status}</span>
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{proc.type}</p>
                          {proc.referenceNumber && (
                            <p className="text-xs text-gray-500">
                              Referencia: <span className="font-mono">{proc.referenceNumber}</span>
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Solicitado: {new Date(proc.requestDate).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        {proc.documents && proc.documents.length > 0 && (
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-600">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>No tienes trámites aún</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Consultas y Solicitudes</h2>
              <Button className="bg-[#1A1A1A] hover:bg-[#1A1A1A]-light">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Consulta
              </Button>
            </div>

            <div className="space-y-3">
              {requests.length > 0 ? (
                requests.map((req) => (
                  <Card key={req.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#1A1A1A]">{req.subject}</h3>
                            <p className="text-sm text-gray-600 mt-1">{req.message}</p>
                          </div>
                          <Badge className={getStatusColor(req.status)}>
                            {req.status}
                          </Badge>
                        </div>

                        {req.response && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <p className="text-sm font-semibold text-blue-900 mb-1">
                              Respuesta del Registro:
                            </p>
                            <p className="text-sm text-blue-800">{req.response}</p>
                          </div>
                        )}

                        <p className="text-xs text-gray-500">
                          {req.respondedAt
                            ? `Respondido: ${new Date(req.respondedAt).toLocaleDateString('es-ES')}`
                            : `Enviado: ${new Date(req.createdAt).toLocaleDateString('es-ES')}`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-600">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>No tienes consultas</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* User Info Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Información de Mi Cuenta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-semibold text-[#1A1A1A]">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-[#1A1A1A]">{user.email}</p>
              </div>
              {user.phone && (
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-semibold text-[#1A1A1A]">{user.phone}</p>
                </div>
              )}
              {user.identityCard && (
                <div>
                  <p className="text-sm text-gray-600">Carné de Identidad</p>
                  <p className="font-semibold text-[#1A1A1A]">{user.identityCard}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Rol</p>
                <Badge className="mt-1 bg-[#1A1A1A] text-white">
                  {user.role === 'user' ? 'Usuario' : user.role}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}