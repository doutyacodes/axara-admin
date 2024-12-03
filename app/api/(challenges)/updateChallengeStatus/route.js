import { NextResponse } from "next/server";
import {
  CHALLENGE_PROGRESS,
  CHALLENGES,
  USER_CHALLENGE_POINTS,
  USER_POINTS,
} from "@/utils/schema";
import { authenticate } from "@/lib/jwtMiddleware";
import { db } from "@/utils";
import { eq } from "drizzle-orm";

export async function POST(req) {
  try {
    const authResult = await authenticate(req, true);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const { challengeId, status } = await req.json();
    // Validate input
    if (!challengeId || !["approve", "reject"].includes(status)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Map 'approve' and 'reject' to the database values
    const mappedStatus = status === "approve" ? "approved" : "rejected";

    const challenge_progress = await db
      .select()
      .from(CHALLENGE_PROGRESS)
      .where(eq(CHALLENGE_PROGRESS.id, challengeId))
      .limit(1)
      .execute();

    const challenge_id = challenge_progress[0].challenge_id;
    const userId = challenge_progress[0].user_id;
    const child_id = challenge_progress[0].child_id;

    let challengeExists;

    const challenge = await db
      .select()
      .from(CHALLENGES)
      .where(eq(CHALLENGES.id, challenge_id))
      .limit(1)
      .execute();

    if (challenge.length > 0) {
      challengeExists = challenge[0].id;
    }

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
      return NextResponse.json(
        { error: "Challenge not found or no update made" },
        { status: 404 }
      );
    }

    if (challengeExists.challenge_type == "upload") {
      const userPoints = await db
        .select()
        .from(USER_POINTS)
        .where(
          and(
            eq(USER_POINTS.user_id, userId),
            eq(USER_POINTS.child_id, child_id)
          )
        )
        .limit(1)
        .execute();

      if (userPoints.length > 0) {
        // Record exists; update points
        const updatedPoints = userPoints[0].points + challengeExists.points;
        await db
          .update(USER_POINTS)
          .set({ points: updatedPoints })
          .where(eq(USER_POINTS.id, userPoints[0].id));
      } else {
        // Record does not exist; create new
        await db.insert(USER_POINTS).values({
          user_id: userId,
          child_id: child_id,
          points: challengeExists.points,
        });
      }
      await db.insert(USER_CHALLENGE_POINTS).values({
        user_id: userId,
        child_id: child_id,
        points: challengeExists.points,
        challenge_id: challenge_id,
      });
    }

    return NextResponse.json({
      message: `Challenge successfully ${mappedStatus}`,
    });
  } catch (error) {
    console.error("Error updating challenge status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
