// Global type declarations

export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;
      MAX_FILE_SIZE: string;
      UPLOAD_DIR: string;
      CLOUDINARY_CLOUD_NAME?: string;
      CLOUDINARY_API_KEY?: string;
      CLOUDINARY_API_SECRET?: string;
    }
  }
}
