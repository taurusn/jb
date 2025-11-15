import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { getCurrentUser } from '@/lib/auth';
import { getEmployerProfile } from '@/backend/services/auth.service';
import cloudinary from '@/lib/cloudinary';
import { extractPathFromUrl, getSignedUrl, downloadPrivateFile } from '@/lib/supabase-storage';

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
async function validateFileAccess(request: NextRequest): Promise<{ user: any; fileParam: string } | NextResponse> {
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

  return { user, fileParam };
}

export async function HEAD(request: NextRequest) {
  try {
    const validation = await validateFileAccess(request);
    if (validation instanceof NextResponse) {
      return validation;
    }

    const { fileParam } = validation;
    console.log('🔍 HEAD request for:', fileParam);

    // Check if this is a Supabase private reference
    if (fileParam.startsWith('supabase-private://')) {
      console.log('🔒 Supabase private reference detected - returning OK');
      // For private references, we trust they exist (will be verified on GET)
      return new NextResponse(null, { status: 200 });
    }

    // Check if this is a Supabase Storage URL (public)
    if (fileParam.includes('.supabase.co/storage/v1/object/public/')) {
      console.log('🗄️ Supabase Storage URL detected - returning OK');
      // For Supabase public URLs, return 200 OK since they're publicly accessible
      return new NextResponse(null, { status: 200 });
    }

    // Check if this is a Cloudinary URL (external URL)
    if (fileParam.startsWith('https://res.cloudinary.com/')) {
      console.log('☁️ Cloudinary URL detected - returning OK');
      // For Cloudinary URLs, return 200 OK since they're publicly accessible
      return new NextResponse(null, { status: 200 });
    }

    // Handle local files (development)
    const safePath = fileParam.replace(/\.\./g, '').replace(/\/\//g, '/');
    const cleanPath = safePath.startsWith('/') ? safePath.substring(1) : safePath;
    const fullPath = path.join(process.cwd(), cleanPath);

    // Ensure the file is within the uploads directory
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    if (!fullPath.startsWith(uploadsDir)) {
      return new NextResponse(null, { status: 403 });
    }

    // Check if file exists
    if (!existsSync(fullPath)) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('File HEAD request error:', error);
    return new NextResponse(null, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const validation = await validateFileAccess(request);
    if (validation instanceof NextResponse) {
      return validation;
    }

    const { fileParam } = validation;
    console.log('🔍 File view request for:', fileParam);

    // Check if this is a Supabase private reference
    if (fileParam.startsWith('supabase-private://')) {
      console.log('🔒 Supabase private reference detected, downloading file...');

      try {
        const pathInfo = extractPathFromUrl(fileParam);

        if (!pathInfo) {
          console.error('❌ Invalid private reference format');
          return NextResponse.json(
            { success: false, error: 'Invalid file reference format' },
            { status: 400 }
          );
        }

        console.log('📝 Extracted path:', pathInfo.path);

        // Download file from private bucket using service role key
        const fileData = await downloadPrivateFile(pathInfo.path);

        if (!fileData) {
          console.error('❌ Failed to download file from Supabase');
          return NextResponse.json(
            { success: false, error: 'Failed to download file from storage' },
            { status: 404 }
          );
        }

        // Extract file extension from path
        const fileExtension = pathInfo.path.match(/\.([^./?]+)$/)?.[1] || 'pdf';

        // Set proper content type based on file extension
        let contentType = fileData.contentType || 'application/pdf';
        if (fileExtension === 'doc') {
          contentType = 'application/msword';
        } else if (fileExtension === 'docx') {
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension.toLowerCase())) {
          contentType = `image/${fileExtension.toLowerCase() === 'jpg' ? 'jpeg' : fileExtension.toLowerCase()}`;
        }

        console.log('✅ Successfully downloaded private file from Supabase');

        // Return the file content with proper headers
        return new NextResponse(fileData.data, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `inline; filename="document.${fileExtension}"`,
            'Cache-Control': 'private, max-age=3600', // Private cache for sensitive files
            'Access-Control-Allow-Origin': '*',
            'X-Content-Type-Options': 'nosniff',
          },
        });
      } catch (error) {
        console.error('❌ Error downloading private file:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to load file from storage' },
          { status: 500 }
        );
      }
    }

    // Check if this is a Supabase Storage URL (public)
    if (fileParam.includes('.supabase.co/storage/v1/object/public/')) {
      console.log('🗄️ Supabase Storage URL detected, proxying file...');

      try {
        // Supabase public URLs are already publicly accessible, just proxy them
        console.log('📡 Fetching directly from Supabase URL:', fileParam);
        const response = await fetch(fileParam);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Failed to fetch from Supabase:', response.status);
          console.error('❌ Error details:', errorText);
          return NextResponse.json(
            { success: false, error: 'Failed to fetch file from Supabase Storage', details: errorText },
            { status: response.status }
          );
        }

        // Get the file content
        const fileBuffer = await response.arrayBuffer();

        // Extract file extension from URL
        const fileExtension = fileParam.match(/\.([^./?]+)(\?|$)/)?.[1] || 'pdf';

        // Set proper content type based on file extension
        let contentType = 'application/pdf';
        if (fileExtension === 'doc') {
          contentType = 'application/msword';
        } else if (fileExtension === 'docx') {
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension.toLowerCase())) {
          contentType = `image/${fileExtension.toLowerCase() === 'jpg' ? 'jpeg' : fileExtension.toLowerCase()}`;
        }

        console.log('✅ Successfully proxied Supabase file');

        // Return the proxied content with proper headers to force inline display
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `inline; filename="document.${fileExtension}"`,
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
            'X-Content-Type-Options': 'nosniff',
          },
        });
      } catch (error) {
        console.error('❌ Error proxying Supabase file:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to load file from Supabase Storage' },
          { status: 500 }
        );
      }
    }

    // Check if this is a Cloudinary URL (external URL)
    if (fileParam.startsWith('https://res.cloudinary.com/')) {
      console.log('☁️ Cloudinary URL detected, generating signed URL and proxying...');

      try {
        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{version}/{public_id}.{extension}
        const urlParts = fileParam.split('/upload/');
        if (urlParts.length < 2) {
          console.error('❌ Invalid Cloudinary URL format');
          return NextResponse.json(
            { success: false, error: 'Invalid file URL format' },
            { status: 400 }
          );
        }

        const pathAfterUpload = urlParts[1];
        // Remove version number if present (v1234567890/path/to/file.pdf -> path/to/file.pdf)
        const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, '');

        // Determine resource type from URL
        const resourceType = urlParts[0].includes('/image/') ? 'image' : 'raw';

        // Extract file extension from original URL for proper Content-Type
        const fileExtension = pathWithoutVersion.match(/\.([^.]+)$/)?.[1] || 'pdf';

        // For raw files with extensions in URL, the extension is part of the public_id
        // For image files without extensions, we need to extract just the id without extension
        let publicId = pathWithoutVersion;
        if (resourceType === 'image') {
          // Remove extension for images
          publicId = pathWithoutVersion.replace(/\.[^/.]+$/, '');
        }
        // For raw files, keep the extension as part of public_id

        console.log('📝 Public ID:', publicId, 'Resource type:', resourceType, 'Extension:', fileExtension);

        // For raw files, just use the direct URL (they're publicly accessible)
        // For images, we can also use direct URLs
        console.log('📡 Fetching directly from Cloudinary URL:', fileParam);
        const response = await fetch(fileParam);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Failed to fetch from Cloudinary:', response.status);
          console.error('❌ Error details:', errorText);
          console.error('❌ Original file URL:', fileParam);
          return NextResponse.json(
            { success: false, error: 'Failed to fetch file from storage', details: errorText },
            { status: response.status }
          );
        }

        // Get the file content
        const fileBuffer = await response.arrayBuffer();

        // Set proper content type based on file extension
        let contentType = 'application/pdf';
        if (fileExtension === 'doc') {
          contentType = 'application/msword';
        } else if (fileExtension === 'docx') {
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }

        console.log('✅ Successfully proxied Cloudinary file');

        // Return the proxied content with proper headers to force inline display
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `inline; filename="document.${fileExtension}"`,
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
            'X-Content-Type-Options': 'nosniff',
          },
        });
      } catch (error) {
        console.error('❌ Error proxying Cloudinary file:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to load file from storage' },
          { status: 500 }
        );
      }
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