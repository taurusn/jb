import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { getCurrentUser } from '@/lib/auth';
import { getEmployerProfile } from '@/backend/services/auth.service';

/**
 * @openapi
 * /api/files/view:
 *   get:
 *     tags:
 *       - Files
 *     summary: View uploaded files (PDF viewer)
 *     description: Secure file viewing endpoint for employers to view candidate resumes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: file
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: File path/URL to view
 *     responses:
 *       200:
 *         description: File content
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/msword:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access forbidden
 *       404:
 *         description: File not found
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication - only authenticated employers can view files
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify employer profile
    const employerProfile = await getEmployerProfile(user.userId);
    if (!employerProfile) {
      return NextResponse.json(
        { success: false, error: 'Access forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileParam = searchParams.get('file');

    if (!fileParam) {
      return NextResponse.json(
        { success: false, error: 'File parameter is required' },
        { status: 400 }
      );
    }

    console.log('🔍 File view request for:', fileParam);

    // Check if this is a Cloudinary URL (external URL)
    if (fileParam.startsWith('https://res.cloudinary.com/')) {
      console.log('☁️ Cloudinary URL detected, redirecting...');
      // For Cloudinary URLs, we can redirect directly since they're already secure
      return NextResponse.redirect(fileParam);
    }

    // Handle local files (development)
    console.log('💾 Local file detected, serving from filesystem...');
    
    // Security: Validate file path to prevent directory traversal
    const safePath = fileParam.replace(/\.\./g, '').replace(/\/\//g, '/');
    
    // Remove leading slash if present and ensure it starts with public/uploads
    const cleanPath = safePath.startsWith('/') ? safePath.substring(1) : safePath;
    const fullPath = path.join(process.cwd(), cleanPath);

    // Ensure the file is within the uploads directory
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    if (!fullPath.startsWith(uploadsDir)) {
      console.log('❌ File outside uploads directory:', fullPath);
      return NextResponse.json(
        { success: false, error: 'Access forbidden' },
        { status: 403 }
      );
    }

    // Check if file exists
    if (!existsSync(fullPath)) {
      console.log('❌ File not found:', fullPath);
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = await readFile(fullPath);
    const fileName = path.basename(fullPath);
    const fileExt = path.extname(fileName).toLowerCase();

    console.log('✅ Serving local file:', fileName);

    // Determine content type
    let contentType = 'application/octet-stream';
    if (fileExt === '.pdf') {
      contentType = 'application/pdf';
    } else if (fileExt === '.doc') {
      contentType = 'application/msword';
    } else if (fileExt === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('File view API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}