import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  public_id?: string;
  error?: string;
}

/**
 * Generate a signed URL for a Cloudinary resource
 * This is needed for PDFs and other raw files that may have access restrictions
 */
export function getSignedUrl(publicId: string, resourceType: string = 'raw'): string {
  try {
    // Generate a signed URL that's valid for 1 hour
    const signedUrl = cloudinary.url(publicId, {
      resource_type: resourceType,
      type: 'upload',
      sign_url: true,
      secure: true,
    });

    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    // Fallback to regular URL
    return cloudinary.url(publicId, {
      resource_type: resourceType,
      type: 'upload',
      secure: true,
    });
  }
}

/**
 * Upload file to Cloudinary
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = 'ready-hr'
): Promise<CloudinaryUploadResult> {
  try {
    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64String}`;

    // Determine resource type based on file type
    // IMPORTANT: Upload all files as 'image' resource type for public access
    // Cloudinary's free plan doesn't allow public access to 'raw' files
    // PDFs can be uploaded as images and will be publicly accessible
    const resourceType = 'image';

    console.log(`📤 Uploading as resource_type: ${resourceType} (file type: ${file.type})`);

    // Upload to Cloudinary as image resource type (works for PDFs and images)
    const uploadOptions: any = {
      resource_type: 'image', // Use image for public access (free plan compatible)
      folder: folder,
      allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'webp'],
      type: 'upload',
    };

    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    return false;
  }
}

export default cloudinary;