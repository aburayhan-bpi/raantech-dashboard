import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { verifyAuth } from '@/lib/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.replace(/['"]/g, '')?.trim() || "dibrstmho",
  api_key: process.env.CLOUDINARY_API_KEY?.replace(/['"]/g, '')?.trim() || "815641187198257",
  api_secret: process.env.CLOUDINARY_API_SECRET?.replace(/['"]/g, '')?.trim() || "oNp6YBh0K63Y1gNzOfvnVq2ZaIM",
});

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    const mimeType = file.type || 'image/png';
    const dataURI = `data:${mimeType};base64,${base64Image}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'raantech_profiles',
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    const err = error as { message?: string };
    return NextResponse.json({ error: err?.message || 'Failed to upload image' }, { status: 500 });
  }
}
