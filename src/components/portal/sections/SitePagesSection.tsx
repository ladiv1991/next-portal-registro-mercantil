'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronRight, ExternalLink, ScrollText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fadeInUp, staggerContainer } from '@/data/portal-data';

interface SitePageItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  visible: boolean;
  order: number;
}

export default function SitePagesSection() {
  const [loading, setLoading] = useState(true);
  const [sitePages, setSitePages] = useState<SitePageItem[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/public/content');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setSitePages(json.data.sitePages || []);
          }
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Render markdown content as HTML (simple version)
  function renderMarkdown(content: string) {
    // Basic markdown rendering for our content
    return (
      <div
        className="prose prose-invert max-w-none text-sm"
        dangerouslySetInnerHTML={{
          __html: content
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br/>')
            .replace(/^(.+)$/gm, '<p>$1</p>')
            .replace(/<p><h([1-3])>(.*?)<\/h[1-3]><\/p>/g, '<h$1>$2</h$1>')
            .replace(/<p><li>(.*?)<\/li><\/p>/g, '<ul><li>$1</li></ul>')
            .replace(/<p><\/p>/g, '')
        }}
      />
    );
  }

  if (loading) {
    return (
      <motion.div {...fadeInUp} initial="initial" animate="animate" exit="exit" className="animate-fade-in-up">
        <section className="bg-[var(--rm-text)] py-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
            <Skeleton className="h-6 w-48 mx-auto mb-4 bg-white/20" />
            <Skeleton className="h-10 w-64 mx-auto mb-3 bg-white/20" />
            <Skeleton className="h-5 w-96 mx-auto bg-white/20" />
          </div>
        </section>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 rounded-xl border border-gray-200">
              <Skeleton className="h-6 w-1/3 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  const legalPages = sitePages.filter(p => p.slug !== 'mapa-sitio'); // Mapa del Sitio shown separately
  const siteMapPage = sitePages.find(p => p.slug === 'mapa-sitio');

  return (
    <motion.div {...fadeInUp} initial="initial" animate="animate" exit="exit" className="animate-fade-in-up">
      {/* Header */}
      <section className="bg-[var(--rm-text)] py-16">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm mb-4">
            <ScrollText className="w-4 h-4" />
            Información Legal
          </span>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text-primary-light mb-3">Páginas Legales</h1>
          <p className="text-white/90 max-w-2xl mx-auto">
            Información institucional, políticas y recursos de navegación del portal.
          </p>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        {/* Legal Pages Grid */}
        {legalPages.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {legalPages.map((page) => (
                <Card key={page.id} className="glass-card overflow-hidden h-full transition-all hover:shadow-xl hover:shadow-[var(--rm-primary)]/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-lg bg-[var(--rm-primary)]/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[var(--rm-primary)]" />
                      </div>
                    </div>
                    <CardTitle className="text-[var(--rm-text)] text-lg">{page.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none text-sm mb-4" style={{ maxHeight: '120px', overflow: 'hidden' }}>
                      {page.content
                        .replace(/^#+\s.*$/gm, '')
                        .replace(/\*\*(.*?)\*\*/g, '$1')
                        .replace(/\*(.*?)\*/g, '$1')
                        .replace(/`(.*?)`/g, '$1')
                        .replace(/^\s*[-*]\s.*$/gm, '')
                        .replace(/^\s*\d+\.\s.*$/gm, '')
                        .substring(0, 200) + '...'}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-white/20 hover:bg-white/10 text-white"
                      onClick={() => window.location.href = `#legal-${page.slug}`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        Leer completo
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Full Content Sections */}
        <div id="legal-content" className="space-y-16">
          {legalPages.map((page) => (
            <section key={page.id} id={`legal-${page.slug}`} className="scroll-mt-20">
              <Card className="glass-card">
                <CardContent className="p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-[var(--rm-primary)]/20 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-[var(--rm-primary)]" />
                    </div>
                    <div>
                      <span className="text-xs text-[var(--rm-primary)] font-medium uppercase tracking-wide">
                        Información Legal
                      </span>
                      <h2 className="text-2xl md:text-3xl font-bold text-[var(--rm-text)] mt-1">{page.title}</h2>
                    </div>
                  </div>
                  <div className="prose prose-invert max-w-3xl">
                    {renderMarkdown(page.content)}
                  </div>
                </CardContent>
              </Card>
            </section>
          ))}

          {/* Mapa del Sitio - Full Width */}
          {siteMapPage && (
            <section id="legal-mapa-sitio" className="scroll-mt-20">
              <Card className="glass-card">
                <CardContent className="p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-[var(--rm-primary)]/20 flex items-center justify-center shrink-0">
                      <ScrollText className="w-6 h-6 text-[var(--rm-primary)]" />
                    </div>
                    <div>
                      <span className="text-xs text-[var(--rm-primary)] font-medium uppercase tracking-wide">
                        Navegación
                      </span>
                      <h2 className="text-2xl md:text-3xl font-bold text-[var(--rm-text)] mt-1">{siteMapPage.title}</h2>
                    </div>
                  </div>
                  <div className="prose prose-invert max-w-4xl">
                    {renderMarkdown(siteMapPage.content)}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Back to top */}
          <div className="text-center pt-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '#home'}
              className="text-white/90 hover:text-white"
            >
              <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}