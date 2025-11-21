import { NextRequest, NextResponse } from 'next/server';
import { handleEmployeeSubmission } from '@/backend/controllers/employee.controller';
import { uploadFile } from '@/lib/upload';
import { prisma as db } from '@/lib/db';

/**
 * @openapi
 * /api/employee/submit:
 *   post:
 *     tags:
 *       - Employee
 *     summary: Submit job application
 *     description: Submit a new employee job application with optional file uploads
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - phone
 *               - city
 *               - education
 *               - skills
 *               - experience
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               city:
 *                 type: string
 *               education:
 *                 type: string
 *               skills:
 *                 type: string
 *               experience:
 *                 type: string
 *               resume:
 *                 type: string
 *                 format: binary
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Applications are currently closed
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    // Check if applications are allowed
    const settings = await db.platformSettings.findFirst({
      where: { id: 'default' },
      select: { allowNewApplications: true },
    });

    if (settings && settings.allowNewApplications === false) {
      return NextResponse.json(
        {
          success: false,
          error: 'New job applications are currently closed. Please check back later.'
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(name="${value.name}", size=${value.size}, type="${value.type}")`);
      } else {
        console.log(`  ${key}: "${value}"`);
      }
    }

    // Extract form fields
    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string | null;
    const city = formData.get('city') as string;
    const nationality = formData.get('nationality') as string;
    const skills = formData.get('skills') as string;
    const experience = formData.get('experience') as string;
    const availableTimeSlots = formData.get('availableTimeSlots') as string | null;
    const iqamaNumber = formData.get('iqamaNumber') as string;
    const iqamaExpiryDate = formData.get('iqamaExpiryDate') as string;
    const kafeelNumber = formData.get('kafeelNumber') as string;

    console.log('\nExtracted text fields:');
    console.log('  fullName:', fullName);
    console.log('  phone:', phone);
    console.log('  email:', email);
    console.log('  city:', city);
    console.log('  nationality:', nationality);
    console.log('  skills:', skills);
    console.log('  experience:', experience);
    console.log('  availableTimeSlots:', availableTimeSlots);
    console.log('  iqamaNumber:', iqamaNumber);
    console.log('  iqamaExpiryDate:', iqamaExpiryDate);
    console.log('  kafeelNumber:', kafeelNumber);

    // Handle file uploads
    const resumeFile = formData.get('resume') as File | null;
    const profilePictureFile = formData.get('profilePicture') as File | null;

    console.log('\nFile uploads:');
    console.log('  resume:', resumeFile ? `File(${resumeFile.name}, ${resumeFile.size} bytes)` : 'null');
    console.log('  profilePicture:', profilePictureFile ? `File(${profilePictureFile.name}, ${profilePictureFile.size} bytes)` : 'null');

    let resumeUrl = '';
    let profilePictureUrl = '';

    // Upload resume if provided
    if (resumeFile && resumeFile.size > 0) {
      console.log('\nUploading resume...');
      const resumeUpload = await uploadFile(resumeFile, 'document', 'resumes');
      console.log('  Resume upload result:', resumeUpload);
      if (resumeUpload.success && resumeUpload.url) {
        resumeUrl = resumeUpload.url;
      }
    }

    // Upload profile picture if provided
    if (profilePictureFile && profilePictureFile.size > 0) {
      console.log('\nUploading profile picture...');
      const pictureUpload = await uploadFile(profilePictureFile, 'image', 'profiles');
      console.log('  Profile picture upload result:', pictureUpload);
      if (pictureUpload.success && pictureUpload.url) {
        profilePictureUrl = pictureUpload.url;
      }
    }

    console.log('\nFinal URLs:');
    console.log('  resumeUrl:', resumeUrl);
    console.log('  profilePictureUrl:', profilePictureUrl);

    // Prepare data
    const applicationData = {
      fullName,
      phone,
      email: email || undefined,
      city,
      nationality,
      skills,
      experience,
      resumeUrl,
      ...(profilePictureUrl && { profilePictureUrl }), // Only include if not empty
      ...(availableTimeSlots && { availableTimeSlots }), // Interview availability
      iqamaNumber,
      iqamaExpiryDate: new Date(iqamaExpiryDate),
      kafeelNumber,
    };

    console.log('\nApplication data to be validated:');
    console.log(JSON.stringify(applicationData, null, 2));
    console.log('=== END DEBUG ===\n');

    // Submit application
    const result = await handleEmployeeSubmission(applicationData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: result.message || 'Application submitted successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Employee submission API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
