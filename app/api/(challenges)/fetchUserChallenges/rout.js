import { db } from "@/utils";
import { eq, and } from "drizzle-orm";
import { CHALLENGES, CHALLENGE_PROGRESS, CHILDREN, CHALLENGE_MAPS, Challenge_PEDOMETER } from "@/utils/schema";
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
    const challengeType = searchParams.get("challenge_type"); // Example: 'upload', 'location', etc.
    const submissionStatus = searchParams.get("submission_status"); // Example: 'pending', 'approved', etc.

    // Building filters dynamically
    const conditions = [];

    // Filter by age
    if (age) {
      conditions.push(eq(CHALLENGES.age, parseInt(age, 10)));
    }

    // Filter by challenge type
    if (challengeType && challengeType !== "all") {
      conditions.push(eq(CHALLENGE_PROGRESS.challenge_type, challengeType));
    }

    // Filter by submission status
    if (submissionStatus) {
      conditions.push(eq(CHALLENGE_PROGRESS.submission_status, submissionStatus));
    }

    // Filter by entry type
    if (entryType && entryType !== "all") {
        conditions.push(eq(CHALLENGES.entry_type, entryType));
    }

    // Fetch data with filters
    const challenges = await db
      .select({
        id: CHALLENGE_PROGRESS.id,
        challengeId: CHALLENGE_PROGRESS.challenge_id,
        challengeType: CHALLENGE_PROGRESS.challenge_type,
        submissionStatus: CHALLENGE_PROGRESS.submission_status,
        childName: CHILDREN.name,
        childAge: CHILDREN.age,
        challengeDetails: {
          title: CHALLENGES.title,
          description: CHALLENGES.description,
          entryType: CHALLENGES.entry_type,
        },
        locationDetails: CHALLENGE_MAPS.map((map) => ({
          latitude: map.latitude,
          longitude: map.longitude,
          reachDistance: map.reach_distance,
        })),
        pedometerDetails: Challenge_PEDOMETER.map((ped) => ({
          steps: ped.steps,
          direction: ped.direction,
        })),
      })
      .from(CHALLENGE_PROGRESS)
      .leftJoin(CHALLENGES, eq(CHALLENGE_PROGRESS.challenge_id, CHALLENGES.id))
      .leftJoin(CHILDREN, eq(CHALLENGE_PROGRESS.child_id, CHILDREN.id))
      .leftJoin(
        CHALLENGE_MAPS,
        and(
          eq(CHALLENGE_PROGRESS.challenge_id, CHALLENGE_MAPS.challenge_id),
          eq(CHALLENGE_PROGRESS.challenge_type, "location")
        )
      )
      .leftJoin(
        Challenge_PEDOMETER,
        and(
          eq(CHALLENGE_PROGRESS.challenge_id, Challenge_PEDOMETER.challenge_id),
          eq(CHALLENGE_PROGRESS.challenge_type, "pedometer")
        )
      )
      .where(and(...conditions));

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
