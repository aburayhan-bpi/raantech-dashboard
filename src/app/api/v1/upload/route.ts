import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { ApiResponse } from '@/lib/apiResponse';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return ApiResponse.error('No file uploaded', 400);
    }

    // Validation (e.g., check if it's an image)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return ApiResponse.error('Invalid file type. Only JPG, PNG, WEBP, GIF, and SVG are allowed.', 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${uniqueSuffix}-${originalName}`;

    // Ensure directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadDir, { recursive: true });

    // Save to local file system
    const path = join(uploadDir, filename);
    await writeFile(path, buffer);

    // Return the public URL
    const fileUrl = `/uploads/${folder}/${filename}`;

    const data = {
      url: fileUrl,
      name: filename,
    };

    return ApiResponse.success(data, 'File uploaded successfully');
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
