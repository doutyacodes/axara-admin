import { NextResponse } from "next/server";
import { db } from "@/utils";
import { authenticate } from "@/lib/jwtMiddleware";
import { USER_ACTIVITIES, ACTIVITIES, CHILDREN } from "@/utils/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req) {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const { searchParams } = new URL(req.url);
    const age = parseInt(searchParams.get('age'), 10);
    const activity_type = searchParams.get('type');

    console.log("age:" , age, "activity_type:", activity_type)

  // Validate input
  if (!age || !activity_type) {
    return res
      .status(400)
      .json({ message: "Please provide age and activity_type filters" });
  }

  try {
    // Parse age
    if (isNaN(age)) {
      return NextResponse.json({ error: "Invalid age value" }, { status: 400 });
    }

    // Query USER_ACTIVITIES and related tables
    const activitiesData = await db
      .select({
        userActivityId: USER_ACTIVITIES.id,
        image: USER_ACTIVITIES.image,
        activityId: ACTIVITIES.id,
        title: ACTIVITIES.title,
        content: ACTIVITIES.content,
        childName: CHILDREN.name,
      })
      .from(USER_ACTIVITIES)
      .innerJoin(ACTIVITIES, eq(USER_ACTIVITIES.activity_id, ACTIVITIES.id))
      .innerJoin(CHILDREN, eq(USER_ACTIVITIES.child_id, CHILDREN.id))
      .where(
        and(
          eq(USER_ACTIVITIES.completion_status, true),
          eq(ACTIVITIES.activity_type, activity_type),
          eq(ACTIVITIES.age, age) // Filter by age in ACTIVITIES table
        )
      );
      console.log("activitiesData", activitiesData);
      

    return NextResponse.json({
        activities:activitiesData,
      }, { status: 200 });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching data" },
      { status: 500 }
    );
  }
}
