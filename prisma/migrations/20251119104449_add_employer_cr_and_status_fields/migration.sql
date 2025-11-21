/*
  Warnings:

  - Added the required column `commercial_registration_image_url` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commercial_registration_number` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EmployerStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable (Step 1: Add nullable columns first)
ALTER TABLE "users"
ADD COLUMN "commercial_registration_image_url" TEXT,
ADD COLUMN "commercial_registration_number" TEXT,
ADD COLUMN "status" "EmployerStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable (Step 2: Update existing rows with placeholder values for testing accounts)
UPDATE "users"
SET "commercial_registration_number" = 'CR-TEST-' || substring(id from 1 for 8),
    "commercial_registration_image_url" = '/uploads/cr-placeholder.pdf'
WHERE "commercial_registration_number" IS NULL;

-- AlterTable (Step 3: Make columns NOT NULL)
ALTER TABLE "users"
ALTER COLUMN "commercial_registration_image_url" SET NOT NULL,
ALTER COLUMN "commercial_registration_number" SET NOT NULL;

-- AlterTable (Step 4: Approve existing test accounts automatically)
UPDATE "users"
SET "status" = 'APPROVED'
WHERE role = 'EMPLOYER';

-- AlterTable (Keep admins approved)
UPDATE "users"
SET "status" = 'APPROVED'
WHERE role = 'ADMIN';

-- AlterTable
ALTER TABLE "employee_applications" ALTER COLUMN "nationality" DROP DEFAULT;
