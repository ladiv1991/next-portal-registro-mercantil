'use client';

import React from 'react';
import { FileText, Layers, Menu, UserCheck, Activity } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { User, CMSStats, CMSView } from './cms-types';
import { getStats } from './cms-api';

interface CmsDashboardProps {
  user: User;
  onNavigate: (view: CMSView) => void;
}

export default function CmsDashboard({ user, onNavigate }: CmsDashboardProps) {
  const [stats, setStats] = React.useState<CMSStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await getStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    {
      label: 'Total Páginas',
      value: stats?.pages ?? 0,
      icon: FileText,
      color: 'text-[#1A1A1A]',
      bgColor: 'bg-[#1A1A1A]/5',
      borderColor: 'border-[#1A1A1A]/10',
      onClick: () => onNavigate('pages'),
    },
    {
      label: 'Total Bloques',
      value: stats?.blocks ?? 0,
      icon: Layers,
      color: 'text-warm-muted',
      bgColor: 'bg-[#7A2A1E]/5',
      borderColor: 'border-[#7A2A1E]/10',
      onClick: () => onNavigate('blocks'),
    },
    {
      label: 'Total Menús',
      value: stats?.menus ?? 0,
      icon: Menu,
      color: 'text-[#9E3A2E]',
      bgColor: 'bg-[#7A2A1E]/5',
      borderColor: 'border-[#7A2A1E]/10',
      onClick: () => onNavigate('menus'),
    },
    {
      label: 'Usuario Activo',
      value: 1,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
      onClick: undefined,
    },
  ];

  const recentActivity = [
    { action: 'Página "Portada" actualizada', time: 'Hace 2 horas', type: 'page' as const },
    { action: 'Bloque "hero" modificado', time: 'Hace 5 horas', type: 'block' as const },
    { action: 'Menú "Trámites" reordenado', time: 'Hace 1 día', type: 'menu' as const },
    { action: 'Página "Estadísticas" creada', time: 'Hace 2 días', type: 'page' as const },
    { action: 'Bloque "search-bar" visible actualizado', time: 'Hace 3 días', type: 'block' as const },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Bienvenido, {user.name}
        </h2>
        <p className="text-gray-500 mt-1">
          Panel de administración del contenido del portal del Registro Mercantil de Cuba.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className={`border ${stat.borderColor} hover:shadow-md transition-shadow ${
                stat.onClick ? 'cursor-pointer' : ''
              }`}
              onClick={stat.onClick}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    {loading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {stat.value}
                      </p>
                    )}
                  </div>
                  <div
                    className={`w-11 h-11 rounded-xl ${stat.bgColor} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <Card className="border-[#7A2A1E]/20 bg-[#7A2A1E]/5">
          <CardContent className="p-4">
            <p className="text-[#9E3A2E] text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-400" />
            <CardTitle className="text-base">Actividad Reciente</CardTitle>
          </div>
          <CardDescription>
            Últimas acciones realizadas en el CMS
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={
                      item.type === 'page'
                        ? 'border-[#1A1A1A]/20 text-[#1A1A1A] bg-[#1A1A1A]/5'
                        : item.type === 'block'
                          ? 'border-[#7A2A1E]/30 text-[#9E3A2E] bg-[#7A2A1E]/5'
                          : 'border-[#7A2A1E]/20 text-[#9E3A2E] bg-[#7A2A1E]/5'
                    }
                  >
                    {item.type === 'page'
                      ? 'Página'
                      : item.type === 'block'
                        ? 'Bloque'
                        : 'Menú'}
                  </Badge>
                  <span className="text-sm text-gray-700">{item.action}</span>
                </div>
                <span className="text-xs text-gray-400 shrink-0 ml-4">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
