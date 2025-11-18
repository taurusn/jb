import { NextRequest, NextResponse } from 'next/server';
import { handleCreateEmployeeRequest, handleGetEmployerRequests } from '@/backend/controllers/employer.controller';
import { getCurrentUser } from '@/lib/auth';
import { getEmployerProfile } from '@/backend/services/auth.service';
import { createInterviewMeeting } from '@/lib/google-calendar';
import { sendCandidateInvitation, sendEmployerInvitation } from '@/lib/email';
import { getEmployeeApplicationById } from '@/backend/services/employee.service';

/**
 * @openapi
 * /api/employer/request:
 *   post:
 *     tags:
 *       - Employer
 *     summary: Request an employee
 *     description: Create a request for a specific employee (employer demands employee)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *             properties:
 *               employeeId:
 *                 type: string
 *                 format: uuid
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Request created successfully
 *       400:
 *         description: Validation error or duplicate request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get employer profile
    const employerProfile = await getEmployerProfile(user.userId);
    if (!employerProfile) {
      return NextResponse.json(
        { success: false, error: 'Employer profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { employeeId, notes, meetingDate, meetingDuration } = body;

    // Get employee application to retrieve candidate details
    const employeeApplication = await getEmployeeApplicationById(employeeId);
    if (!employeeApplication) {
      return NextResponse.json(
        { success: false, error: 'Employee application not found' },
        { status: 404 }
      );
    }

    let meetingData = null;

    // If meeting details are provided, try to create the interview meeting
    if (meetingDate && meetingDuration) {
      console.log('Creating interview meeting...');

      const meetingDateTime = new Date(meetingDate);

      try {
        // Create Google Meet link
        const meetingResult = await createInterviewMeeting({
          candidateName: employeeApplication.fullName,
          candidateEmail: employeeApplication.email || '',
          employerName: employerProfile.companyName || 'Employer',
          employerEmail: employerProfile.user.email || user.email || '',
          meetingDate: meetingDateTime,
          durationMinutes: meetingDuration,
        });

        if (!meetingResult.success) {
          console.error('Failed to create meeting:', meetingResult.error);
          // Continue without meeting link - request will be created but without calendar invite
        } else {

          // Calculate meeting end time
          const meetingEndsAt = new Date(meetingDateTime.getTime() + meetingDuration * 60 * 1000);

          meetingData = {
            meetingLink: meetingResult.meetingLink,
            meetingDate: meetingDateTime,
            meetingDuration,
            meetingEndsAt,
          };

          console.log('Meeting created successfully:', meetingData);

          // Send email invitations to both parties
          if (employeeApplication.email) {
            const candidateEmailResult = await sendCandidateInvitation({
              candidateName: employeeApplication.fullName,
              candidateEmail: employeeApplication.email,
              employerName: employerProfile.companyName || 'Employer',
              companyName: employerProfile.companyName || 'Employer',
              meetingDate: meetingDateTime,
              duration: meetingDuration,
              meetingLink: meetingResult.meetingLink!,
            });

            if (!candidateEmailResult.success) {
              console.error('Failed to send candidate email:', candidateEmailResult.error);
            }
          }

          const employerEmailResult = await sendEmployerInvitation({
            candidateName: employeeApplication.fullName,
            employerName: employerProfile.companyName || 'Employer',
            companyName: employerProfile.companyName || 'Employer',
            employerEmail: employerProfile.user.email || user.email || '',
            meetingDate: meetingDateTime,
            duration: meetingDuration,
            meetingLink: meetingResult.meetingLink!,
          });

          if (!employerEmailResult.success) {
            console.error('Failed to send employer email:', employerEmailResult.error);
          }
        }
      } catch (error) {
        console.error('Error in meeting creation process:', error);
        // Continue without meeting - request will be created but without calendar invite
      }
    }

    // Add employer ID and meeting data to request data
    const requestData = {
      employeeId,
      notes,
      employerId: employerProfile.id,
      ...meetingData,
    };

    // Create request
    const result = await handleCreateEmployeeRequest(requestData);

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
        message: meetingData
          ? 'Request created successfully. Interview scheduled and invitations sent.'
          : 'Request created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create employee request API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /api/employer/request:
 *   get:
 *     tags:
 *       - Employer
 *     summary: Get employer's requests
 *     description: Get all requests made by the authenticated employer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of requests
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get employer profile
    const employerProfile = await getEmployerProfile(user.userId);
    if (!employerProfile) {
      return NextResponse.json(
        { success: false, error: 'Employer profile not found' },
        { status: 404 }
      );
    }

    // Get requests
    const result = await handleGetEmployerRequests(employerProfile.id);

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
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get employer requests API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
