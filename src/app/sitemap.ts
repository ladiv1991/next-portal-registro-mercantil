import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://registro-mercantil.xetid.cu'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/portal/tramites`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/portal/consultas`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/portal/normatividad`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/portal/asistencia`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  try {
    const [pages, services] = await Promise.all([
      db.page.findMany({
        where: { visible: true },
        select: { slug: true, updatedAt: true },
      }),
      db.service.findMany({
        where: { visible: true },
        select: { id: true, updatedAt: true },
      }),
    ])

    const dynamicEntries: MetadataRoute.Sitemap = [
      ...pages.map((page) => ({
        url: `${BASE_URL}/portal/pagina/${page.slug}`,
        lastModified: page.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
      ...services.map((service) => ({
        url: `${BASE_URL}/portal/servicios/${service.id}`,
        lastModified: service.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
    ]

    return [...staticEntries, ...dynamicEntries]
  } catch {
    // Si la DB no está disponible, devolver al menos las rutas estáticas
    return staticEntries
  }
}