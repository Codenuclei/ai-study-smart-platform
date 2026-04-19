import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { getSession } from '@/lib/auth-utils';
import { uploadToCloudinary } from '@/lib/cloudinary';

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

    // 1. Upload to Cloudinary (optional/background)
    let fileUrl = '';
    try {
      fileUrl = await uploadToCloudinary(buffer, file.name);
    } catch (uploadError) {
      console.warn('Cloudinary upload failed:', uploadError);
    }

    // 2. Parse PDF using the v2.x class-based API
    const parser = new PDFParse({ data: buffer });
    const textData = await parser.getText();
    const infoData = await parser.getInfo();

    // Clean up parser resources
    await parser.destroy();

    const text = textData.text;

    return NextResponse.json({
      text,
      fileUrl,
      metadata: {
        pages: textData.pages.length,
        title: infoData.info?.Title || file.name,
        author: infoData.info?.Author || 'Unknown'
      }
    });
  } catch (error) {
    console.error('[MATERIALS_EXTRACT]', error);
    return NextResponse.json({ error: 'Failed to extract text from PDF' }, { status: 500 });
  }
}
