-- AlterTable
ALTER TABLE "employee_applications" ADD COLUMN     "video_url" TEXT,
ALTER COLUMN "resume_url" DROP NOT NULL;
