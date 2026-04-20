import { NextResponse } from 'next/server';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { getSession } from '@/lib/auth-utils';
import { uploadToCloudinary } from '@/lib/cloudinary';
import path from 'path';

// Set the workerSrc to the installed pdfjs-dist legacy worker
GlobalWorkerOptions.workerSrc = `file://${path.join(
  process.cwd(),
  'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'
)}`;

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Convert Buffer to Uint8Array for pdfjs-dist
    const uint8Array = new Uint8Array(buffer);

    // Upload to Cloudinary (optional/background)
    let fileUrl = '';
    try {
      fileUrl = await uploadToCloudinary(buffer, file.name);
    } catch (uploadError) {
      console.warn('Cloudinary upload failed:', uploadError);
    }

    // Use pdfjs-dist to extract text
    const loadingTask = getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ') + '\n';
    }

    return NextResponse.json({
      text,
      fileUrl,
      metadata: {
        pages: pdf.numPages,
        title: file.name,
        author: 'Unknown'
      }
    });
  } catch (error) {
    console.error('[MATERIALS_EXTRACT]', error);
    return NextResponse.json({ error: 'Failed to extract text from PDF' }, { status: 500 });
  }
}
