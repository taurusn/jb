import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/settings/public
 * Public endpoint to fetch platform settings (no authentication required)
 * Used by middleware and public pages to check platform status
 */
export async function GET() {
  try {
    const settings = await prisma.platformSettings.findFirst({
      where: { id: 'default' },
      select: {
        maintenanceMode: true,
        allowNewRegistrations: true,
        allowNewApplications: true,
      },
    });

    if (!settings) {
      // Return safe defaults if no settings exist
      return NextResponse.json({
        maintenanceMode: false,
        allowNewRegistrations: true,
        allowNewApplications: true,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching public platform settings:', error);
    // Return safe defaults on error
    return NextResponse.json({
      maintenanceMode: false,
      allowNewRegistrations: true,
      allowNewApplications: true,
    });
  }
}
