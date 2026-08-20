import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se proporcionó archivo' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadsDir, { recursive: true });

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${timestamp}_${safeName}`;
    const filePath = `/uploads/${folder}/${fileName}`;
    const fullPath = path.join(uploadsDir, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(fullPath, Buffer.from(bytes));

    return NextResponse.json({
      success: true,
      data: {
        fileName,
        filePath,
        fileSize: file.size,
        fileType: file.type,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al subir archivo';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
