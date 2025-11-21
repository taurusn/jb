import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/upload';

/**
 * POST /api/upload
 * Upload a file (image or document)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;
    const subfolder = formData.get('subfolder') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Determine file type (default to 'image')
    const fileType = (type === 'document' ? 'document' : 'image') as 'image' | 'document';

    // Upload file
    const result = await uploadFile(file, fileType, subfolder || '');

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Upload failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
