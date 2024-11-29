import { db } from "@/utils";
import { eq, and } from "drizzle-orm";
import { CHALLENGES, CHALLENGE_PROGRESS, CHILDREN } from "@/utils/schema";
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";

export async function GET(req) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const { searchParams } = new URL(req.url);

    // Filters from query parameters
    const age = searchParams.get("age"); // Single age value
    const submissionStatus = searchParams.get("submissionStatus"); // Example: 'pending', 'approved', etc.
    const entryType = searchParams.get("entryType"); // Example: 'points', 'fee', etc.

    console.log("age", age, "submissionStatus", submissionStatus, "entryType", entryType);
    
    // Building filters dynamically
    const conditions = [];

    // Filter by age
if (age) {
    conditions.push(eq(CHALLENGES.age, parseInt(age, 10))); // Updated to filter from CHALLENGES table
  }
  
  // Filter by submission status
  if (submissionStatus) {
    conditions.push(eq(CHALLENGE_PROGRESS.submission_status, submissionStatus));
  }
  
  // Filter by entry type
  if (entryType && entryType !== "all") {
    conditions.push(eq(CHALLENGES.entry_type, entryType));
  }


    // Filter by challenge_type (only for "upload")
    conditions.push(eq(CHALLENGES.challenge_type, "upload")); // Ensures only "upload" type challenges
  
  // Fetch data with filters
  const challenges = await db
    .select({
      id: CHALLENGE_PROGRESS.id,
      challengeId: CHALLENGE_PROGRESS.challenge_id,
      submissionStatus: CHALLENGE_PROGRESS.submission_status,
      image: CHALLENGE_PROGRESS.image,
      childName: CHILDREN.name,
      childAge: CHILDREN.age,
      challengeDetails: {
        title: CHALLENGES.title,
        description: CHALLENGES.description,
        entryType: CHALLENGES.entry_type,
      },
    })
    .from(CHALLENGE_PROGRESS)
    .leftJoin(CHALLENGES, eq(CHALLENGE_PROGRESS.challenge_id, CHALLENGES.id))
    .leftJoin(CHILDREN, eq(CHALLENGE_PROGRESS.child_id, CHILDREN.id))
    .where(and(...conditions));

    console.log(challenges)
    // Response
    return NextResponse.json(
      {
        message: "Challenges fetched successfully",
        challenges,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json(
      {
        message: "Error fetching challenges",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
