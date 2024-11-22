import { db } from '@/utils';
import { LEARN_SUBJECTS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req) {
  // Authenticate user
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    // Fetch all subjects from the LEARN_SUBJECTS table
    const subjects = await db.select().from(LEARN_SUBJECTS);

    // Send the subjects as a JSON response
    return NextResponse.json({ subjects }, { status: 200 });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { message: "Error fetching subjects", details: error.message },
      { status: 500 }
    );
  }
}
