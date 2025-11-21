-- AlterTable: Replace education with nationality and make document fields required

-- Step 1: Add nationality column with temporary default
ALTER TABLE "employee_applications" ADD COLUMN "nationality" TEXT NOT NULL DEFAULT 'Not Specified';

-- Step 2: Drop the education column
ALTER TABLE "employee_applications" DROP COLUMN "education";

-- Step 3: Update NULL resume_url to empty string, then make required
UPDATE "employee_applications" SET "resume_url" = '' WHERE "resume_url" IS NULL;
ALTER TABLE "employee_applications" ALTER COLUMN "resume_url" SET NOT NULL;

-- Step 4: Update NULL iqama_number to empty string, then make required
UPDATE "employee_applications" SET "iqama_number" = '' WHERE "iqama_number" IS NULL;
ALTER TABLE "employee_applications" ALTER COLUMN "iqama_number" SET NOT NULL;

-- Step 5: Update NULL iqama_expiry_date to a far future date, then make required
UPDATE "employee_applications" SET "iqama_expiry_date" = '2099-12-31'::timestamp WHERE "iqama_expiry_date" IS NULL;
ALTER TABLE "employee_applications" ALTER COLUMN "iqama_expiry_date" SET NOT NULL;

-- Step 6: Update NULL kafeel_number to empty string, then make required
UPDATE "employee_applications" SET "kafeel_number" = '' WHERE "kafeel_number" IS NULL;
ALTER TABLE "employee_applications" ALTER COLUMN "kafeel_number" SET NOT NULL;
