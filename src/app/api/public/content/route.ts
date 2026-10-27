import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [sliders, services, statistics, news, procedures, regulations, faqs, videoTutorials, webinars, contactChannels, guides] = await Promise.all([
      db.slider.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
      db.service.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
      db.statistic.findMany({ orderBy: { order: 'asc' } }),
      db.newsArticle.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
      db.procedure.findMany({ where: { visible: true }, orderBy: { order: 'asc' }, include: { documents: { orderBy: { order: 'asc' } } } }),
      db.regulation.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
      db.fAQ.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
      db.videoTutorial.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
      db.webinar.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
      db.contactChannel.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
      db.guide.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        sliders,
        services,
        statistics,
        news: news,
        procedures,
        regulations,
        faqs,
        videoTutorials,
        webinars,
        contactChannels,
        guides,
      },
    });
  } catch (error) {
    console.error('[API] Internal error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor. Por favor, inténtelo más tarde.' }, { status: 500 });
  }
}
