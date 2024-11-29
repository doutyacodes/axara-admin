import { NextResponse } from 'next/server';
import { CHALLENGE_PROGRESS } from "@/utils/schema";
import { authenticate } from '@/lib/jwtMiddleware';
import { db } from '@/utils';
import { eq } from 'drizzle-orm';

export async function POST(req) {
  try {
    const authResult = await authenticate(req, true);
    if (!authResult.authenticated) {
      return authResult.response;
    }
  
    const { challengeId, status } = await req.json();
    // Validate input
    if (!challengeId || !['approve', 'reject'].includes(status)) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

  // Map 'approve' and 'reject' to the database values
  const mappedStatus = status === 'approve' ? 'approved' : 'rejected';

  // Update the challenge status
  const result = await db
    .update(CHALLENGE_PROGRESS)
    .set({
        submission_status: mappedStatus,
        updated_at: new Date(),
    })
    .where(eq(CHALLENGE_PROGRESS.id, challengeId));
    console.log("resiult", result);
    
  if (result.affectedRows === 0) {
    return NextResponse.json({ error: 'Challenge not found or no update made' }, { status: 404 });
  }

  return NextResponse.json({ message: `Challenge successfully ${mappedStatus}` });
} catch (error) {
  console.error('Error updating challenge status:', error);
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}
}