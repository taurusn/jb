import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Check if Supabase Storage is configured
export const hasSupabaseStorage = !!(supabaseUrl && supabaseServiceKey);

// Create Supabase client with service role key for server-side operations
// This client has full access to bypass RLS policies
const supabase = hasSupabaseStorage
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export interface SupabaseUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

const BUCKET_NAME = 'JB'; // Your bucket name
const IS_PRIVATE_BUCKET = true; // Set to true for private bucket (recommended for sensitive data)

/**
 * Upload file to Supabase Storage
 * @param file - File to upload
 * @param folder - Folder path within bucket (e.g., 'resumes', 'profiles')
 * @param isPublic - Whether file should be publicly accessible (default: true for profiles, false for resumes)
 */
export async function uploadToSupabase(
  file: File,
  folder: string = '',
  isPublic: boolean = true
): Promise<SupabaseUploadResult> {
  try {
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase Storage is not configured',
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const sanitizedName = file.name
      .split('.')
      .slice(0, -1)
      .join('.')
      .replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueFileName = `${sanitizedName}_${timestamp}_${randomString}.${fileExt}`;

    // Build file path: folder/filename
    const filePath = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

    console.log(`📤 Uploading to Supabase Storage: ${BUCKET_NAME}/${filePath} (${IS_PRIVATE_BUCKET ? 'Private' : 'Public'} bucket)`);

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error('❌ Supabase upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ Supabase upload successful:', data.path);

    // For private buckets, we'll store a special URL format that our API can recognize
    // Format: supabase-private://{bucket}/{path}
    // For public buckets, use the regular public URL
    let fileUrl: string;

    if (IS_PRIVATE_BUCKET) {
      // Store path reference for private bucket
      // Our API will generate signed URLs on-demand when viewing
      fileUrl = `supabase-private://${BUCKET_NAME}/${data.path}`;
      console.log('🔒 Private bucket - storing path reference:', fileUrl);
    } else {
      // Public bucket - generate direct public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);
      fileUrl = urlData.publicUrl;
      console.log('🌐 Public bucket - storing public URL:', fileUrl);
    }

    return {
      success: true,
      url: fileUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Supabase upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Generate a signed URL for private file access
 * @param filePath - Path to file in bucket
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 */
export async function getSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    if (!supabase) {
      console.error('Supabase Storage is not configured');
      return null;
    }

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Error generating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Signed URL generation error:', error);
    return null;
  }
}

/**
 * Delete file from Supabase Storage
 * @param filePath - Path to file in bucket
 */
export async function deleteFromSupabase(filePath: string): Promise<boolean> {
  try {
    if (!supabase) {
      console.error('Supabase Storage is not configured');
      return false;
    }

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    if (error) {
      console.error('Supabase deletion error:', error);
      return false;
    }

    console.log('✅ File deleted from Supabase:', filePath);
    return true;
  } catch (error) {
    console.error('File deletion error:', error);
    return false;
  }
}

/**
 * Download file from private bucket using service role key
 * @param filePath - Path to file in bucket
 * @returns File buffer or null
 */
export async function downloadPrivateFile(
  filePath: string
): Promise<{ data: ArrayBuffer; contentType: string } | null> {
  try {
    if (!supabase) {
      console.error('Supabase Storage is not configured');
      return null;
    }

    console.log('🔒 Downloading private file from Supabase:', filePath);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath);

    if (error) {
      console.error('Error downloading private file:', error);
      return null;
    }

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await data.arrayBuffer();

    return {
      data: arrayBuffer,
      contentType: data.type || 'application/octet-stream',
    };
  } catch (error) {
    console.error('Private file download error:', error);
    return null;
  }
}

/**
 * Extract file path from Supabase URL or private reference
 * @param url - Supabase URL or private reference
 * @returns Object with bucket, path, and isPrivate flag
 */
export function extractPathFromUrl(url: string): { bucket: string; path: string; isPrivate: boolean } | null {
  try {
    // Check if this is a private reference: supabase-private://{bucket}/{path}
    if (url.startsWith('supabase-private://')) {
      const withoutProtocol = url.replace('supabase-private://', '');
      const firstSlashIndex = withoutProtocol.indexOf('/');

      if (firstSlashIndex === -1) return null;

      const bucket = withoutProtocol.substring(0, firstSlashIndex);
      const path = withoutProtocol.substring(firstSlashIndex + 1);

      return { bucket, path, isPrivate: true };
    }

    // Public URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
    const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (match) {
      return { bucket: match[1], path: match[2], isPrivate: false };
    }

    return null;
  } catch (error) {
    console.error('Error extracting path from URL:', error);
    return null;
  }
}

export default supabase;
