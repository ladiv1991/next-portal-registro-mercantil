'use client';

import React from 'react';
import {
  LayoutDashboard,
  Menu,
  FileText,
  Layers,
  LogOut,
  Shield,
  ChevronRight,
  Image,
  Briefcase,
  ClipboardList,
  Scale,
  HelpCircle,
  Newspaper,
  Video,
  Calendar,
  Phone,
  BarChart3,
  Search,
  Globe,
  Bot,
  BookOpen,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { User, CMSView } from './cms-types';
import CmsDashboard from './cms-dashboard';
import CmsMenus from './cms-menus';
import CmsPages from './cms-pages';
import CmsBlocks from './cms-blocks';
import CmsSliders from './cms-sliders';
import CmsServices from './cms-services';
import CmsProcedures from './cms-procedures';
import CmsRegulations from './cms-regulations';
import CmsFAQ from './cms-faq';
import CmsNews from './cms-news';
import CmsWebinars from './cms-webinars';
import CmsTutorials from './cms-tutorials';
import CmsContacts from './cms-contacts';
import CmsStatistics from './cms-statistics';
import CmsSearchNames from './cms-search-names';
import CmsSitePages from './cms-site-pages';
import CmsBotConfig from './cms-bot-config';
import CmsGuides from './cms-guides';

interface CmsLayoutProps {
  user: User;
  onLogout: () => void;
}

interface NavItem {
  id: CMSView;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Contenido',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'sliders', label: 'Sliders', icon: Image },
      { id: 'services', label: 'Servicios', icon: Briefcase },
      { id: 'news', label: 'Noticias', icon: Newspaper },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { id: 'procedures', label: 'Trámites', icon: ClipboardList },
      { id: 'regulations', label: 'Normativas', icon: Scale },
      { id: 'faq', label: 'FAQ', icon: HelpCircle },
      { id: 'tutorials', label: 'Tutoriales', icon: Video },
      { id: 'webinars', label: 'Webinars', icon: Calendar },
      { id: 'guides', label: 'Guías', icon: BookOpen },
    ],
  },
  {
    title: 'Configuración',
    items: [
      { id: 'menus', label: 'Menús', icon: Menu },
      { id: 'pages', label: 'Páginas', icon: FileText },
      { id: 'blocks', label: 'Bloques', icon: Layers },
      { id: 'statistics', label: 'Estadísticas', icon: BarChart3 },
      { id: 'search-names', label: 'Nombres Buscables', icon: Search },
      { id: 'site-pages', label: 'Páginas del Sitio', icon: Globe },
      { id: 'contacts', label: 'Contactos', icon: Phone },
      { id: 'bot-config', label: 'Bot IA', icon: Bot },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

const BREADCRUMB_MAP: Record<CMSView, string> = {
  dashboard: 'Panel de Control',
  menus: 'Gestión de Menús',
  pages: 'Gestión de Páginas',
  blocks: 'Gestión de Bloques',
  sliders: 'Gestión de Sliders',
  services: 'Gestión de Servicios',
  procedures: 'Gestión de Trámites',
  regulations: 'Gestión de Normativas',
  faq: 'Preguntas Frecuentes',
  news: 'Gestión de Noticias',
  webinars: 'Gestión de Webinars',
  tutorials: 'Gestión de Tutoriales',
  guides: 'Gestión de Guías',
  contacts: 'Canales de Contacto',
  statistics: 'Estadísticas del Portal',
  'search-names': 'Nombres Buscables',
  'site-pages': 'Páginas del Sitio',
  'bot-config': 'Configuración Bot IA',
};

export default function CmsLayout({ user, onLogout }: CmsLayoutProps) {
  const [activeView, setActiveView] = React.useState<CMSView>('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <CmsDashboard user={user} onNavigate={setActiveView} />;
      case 'menus': return <CmsMenus />;
      case 'pages': return <CmsPages />;
      case 'blocks': return <CmsBlocks />;
      case 'sliders': return <CmsSliders />;
      case 'services': return <CmsServices />;
      case 'procedures': return <CmsProcedures />;
      case 'regulations': return <CmsRegulations />;
      case 'faq': return <CmsFAQ />;
      case 'news': return <CmsNews />;
      case 'webinars': return <CmsWebinars />;
      case 'tutorials': return <CmsTutorials />;
      case 'contacts': return <CmsContacts />;
      case 'statistics': return <CmsStatistics />;
      case 'search-names': return <CmsSearchNames />;
      case 'site-pages': return <CmsSitePages />;
      case 'bot-config': return <CmsBotConfig />;
      case 'guides': return <CmsGuides />;
      default: return <CmsDashboard user={user} onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ====== SIDEBAR ====== */}
      <aside className="w-64 bg-[#1A1A1A] flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[#1A1A1A]-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#9E3A2E]/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#9E3A2E]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm leading-tight">
                CMS Registro
              </h1>
              <p className="text-[#9E3A2E] text-xs">Mercantil de Cuba</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          <nav className="px-3 space-y-5">
            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  {group.title}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-[#9E3A2E]/15 text-[#9E3A2E]'
                            : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]-light'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User info + Logout */}
        <div className="px-4 py-4 border-t border-[#1A1A1A]-light">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#9E3A2E]/20 flex items-center justify-center text-[#9E3A2E] text-sm font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user.name}
              </p>
              <p className="text-gray-500 text-xs truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start text-gray-400 hover:text-[#9E3A2E] hover:bg-[#7A2A1E]/10 px-4"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* ====== MAIN AREA ====== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">CMS</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-900 font-medium">
              {BREADCRUMB_MAP[activeView]}
            </span>
          </div>

          {/* User Badge */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user.name}</span>
            <Badge
              variant="outline"
              className={
                user.role === 'admin'
                  ? 'border-[#7A2A1E] text-[#9E3A2E] bg-[#7A2A1E]/5'
                  : 'border-gray-400 text-gray-600'
              }
            >
              {user.role === 'admin' ? 'Administrador' : user.role}
            </Badge>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
