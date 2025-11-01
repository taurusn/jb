import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'public/uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default

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
 * Validate file
 */
function validateFile(file: File, type: 'image' | 'document'): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    };
  }

  // Check file extension
  const ext = path.extname(file.name).toLowerCase();
  const allowedExtensions =
    type === 'image' ? ALLOWED_EXTENSIONS.images : ALLOWED_EXTENSIONS.documents;

  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Upload file to local storage
 */
export async function uploadFile(
  file: File,
  type: 'image' | 'document' = 'image',
  subfolder: string = ''
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(file, type);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

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
  type: 'image' | 'document' = 'image',
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
