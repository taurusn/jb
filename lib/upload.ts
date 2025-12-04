import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { uploadToCloudinary } from './cloudinary';
import { uploadToSupabase, hasSupabaseStorage } from './supabase-storage';
import { fileTypeFromBuffer } from 'file-type';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'public/uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default
const MAX_VIDEO_SIZE = parseInt(process.env.MAX_VIDEO_SIZE || '52428800'); // 50MB default for videos

// Check storage providers (priority: Supabase > Cloudinary > Local)
const hasCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

// Determine which storage to use (Supabase first, then Cloudinary, then local)
const useSupabase = hasSupabaseStorage;
const useCloudinary = !useSupabase && hasCloudinary;

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Allowed file extensions
 */
const ALLOWED_EXTENSIONS = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  documents: ['.pdf', '.doc', '.docx'],
  videos: ['.mp4', '.webm', '.mov'],  // Supported video formats
};

/**
 * Generate a unique filename
 */
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
  return `${sanitizedName}_${timestamp}_${randomString}${ext}`;
}

/**
 * Validate file extension and magic bytes
 */
async function validateFile(
  file: File,
  type: 'image' | 'document' | 'video'
): Promise<{ valid: boolean; error?: string }> {
  // Check file size based on type
  const maxSize = type === 'video' ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
    };
  }

  // Check file extension
  const ext = path.extname(file.name).toLowerCase();
  const allowedExtensions =
    type === 'image'
      ? ALLOWED_EXTENSIONS.images
      : type === 'video'
      ? ALLOWED_EXTENSIONS.videos
      : ALLOWED_EXTENSIONS.documents;

  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`,
    };
  }

  // Magic byte validation (verify file content matches extension)
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileType = await fileTypeFromBuffer(buffer);

    if (!fileType) {
      // Some file types (like plain text) may not have magic bytes
      // Allow certain extensions without magic bytes
      const allowedWithoutMagic = ['.txt', '.csv'];
      if (!allowedWithoutMagic.includes(ext)) {
        return {
          valid: false,
          error: 'Unable to verify file type. File may be corrupted.',
        };
      }
      return { valid: true };
    }

    // Expected MIME types for each extension
    const mimeTypeMap: Record<string, string[]> = {
      '.jpg': ['image/jpeg'],
      '.jpeg': ['image/jpeg'],
      '.png': ['image/png'],
      '.gif': ['image/gif'],
      '.webp': ['image/webp'],
      '.pdf': ['application/pdf'],
      '.doc': ['application/msword'],
      '.docx': [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      '.mp4': ['video/mp4'],
      '.webm': ['video/webm'],
      '.mov': ['video/quicktime'],
    };

    const expectedMimeTypes = mimeTypeMap[ext];

    if (!expectedMimeTypes || !expectedMimeTypes.includes(fileType.mime)) {
      return {
        valid: false,
        error: `File content does not match extension. Expected ${ext} but got ${fileType.mime}`,
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('Magic byte validation error:', error);
    return {
      valid: false,
      error: 'File validation failed. Please try again.',
    };
  }
}

/**
 * Upload file (automatically uses Supabase > Cloudinary > Local storage)
 */
export async function uploadFile(
  file: File,
  type: 'image' | 'document' | 'video' = 'image',
  subfolder: string = ''
): Promise<UploadResult> {
  try {
    // Validate file (extension + magic bytes)
    const validation = await validateFile(file, type);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const storageType = useSupabase
      ? 'Supabase Storage'
      : useCloudinary
      ? 'Cloudinary'
      : 'Local filesystem';
    console.log(`📁 Upload strategy: ${storageType}`);

    // Use Supabase Storage if configured (Priority #1)
    if (useSupabase) {
      console.log('🗄️ Uploading to Supabase Storage...');
      const folder = subfolder || type;
      const result = await uploadToSupabase(file, folder, true);

      if (result.success && result.url) {
        console.log('✅ Supabase upload successful:', result.url);
        return {
          success: true,
          url: result.url,
        };
      } else {
        console.error('❌ Supabase upload failed:', result.error);
        return { success: false, error: result.error || 'Supabase upload failed' };
      }
    }

    // Use Cloudinary if configured (Priority #2)
    if (useCloudinary) {
      console.log('☁️ Uploading to Cloudinary...');
      const cloudFolder = `ready-hr/${subfolder || type}`;
      const result = await uploadToCloudinary(file, cloudFolder);

      if (result.success && result.url) {
        console.log('✅ Cloudinary upload successful:', result.url);
        return {
          success: true,
          url: result.url,
        };
      } else {
        console.error('❌ Cloudinary upload failed:', result.error);
        return { success: false, error: result.error || 'Cloudinary upload failed' };
      }
    }

    // Use local storage (Priority #3 - fallback when no cloud storage is configured)
    console.log('💾 Using local storage...');
    
    // Create upload directory if it doesn't exist
    const uploadPath = path.join(process.cwd(), UPLOAD_DIR, subfolder);
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true });
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name);
    const filePath = path.join(uploadPath, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return public URL
    const publicUrl = `/${UPLOAD_DIR}/${subfolder ? subfolder + '/' : ''}${filename}`;

    console.log('✅ Local upload successful:', publicUrl);
    return {
      success: true,
      url: publicUrl,
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  type: 'image' | 'document' | 'video' = 'image',
  subfolder: string = ''
): Promise<UploadResult[]> {
  return Promise.all(files.map((file) => uploadFile(file, type, subfolder)));
}

/**
 * Delete file from local storage
 */
export async function deleteFile(fileUrl: string): Promise<boolean> {
  try {
    const { unlink } = await import('fs/promises');
    const filePath = path.join(process.cwd(), 'public', fileUrl);
    await unlink(filePath);
    return true;
  } catch (error) {
    console.error('File deletion error:', error);
    return false;
  }
}
