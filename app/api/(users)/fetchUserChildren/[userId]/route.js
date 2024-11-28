import { NextResponse } from "next/server";
import { db } from "@/utils";
import { authenticate } from "@/lib/jwtMiddleware";
import { CHILDREN   } from "@/utils/schema";
import { eq } from "drizzle-orm";

export async function GET(req, { params }) {
  const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

  const { userId } = await params;

  // Validate the input
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    // Fetch children linked to the given user ID
    const children = await db
      .select({
        id: CHILDREN.id,
        name: CHILDREN.name,
        gender: CHILDREN.gender,
        age: CHILDREN.age,
        grade: CHILDREN.grade,
        createdAt: CHILDREN.created_at,
      })
      .from(CHILDREN)
      .where(eq(CHILDREN.user_id, parsedUserId));
    
    return NextResponse.json({children}, { status: 200 });
  } catch (error) {
    console.error("Error fetching children:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching children" },
      { status: 500 }
    );
  }
}
