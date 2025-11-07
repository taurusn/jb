-- AlterTable
ALTER TABLE "employee_applications" ADD COLUMN     "available_time_slots" TEXT;

-- AlterTable
ALTER TABLE "employee_requests" ADD COLUMN     "meeting_date" TIMESTAMP(3),
ADD COLUMN     "meeting_duration" INTEGER,
ADD COLUMN     "meeting_ends_at" TIMESTAMP(3),
ADD COLUMN     "meeting_link" TEXT;
