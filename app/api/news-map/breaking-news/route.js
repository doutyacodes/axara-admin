import { db } from "@/utils";
import { MAP_NEWS } from "@/utils/schema";
import { NextResponse } from "next/server";
import { eq, desc, and, or, gt, isNull } from "drizzle-orm";

export async function GET(req) {
  try {
    // Fetch only active breaking news (not expired) ordered by creation date (newest first)
    const breakingNews = await db
      .select()
      .from(MAP_NEWS)
      .where(
        and(
          eq(MAP_NEWS.is_breaking, true),
          // Only include items that are not expired (breaking_expire_at is null or in the future)
          or(
            isNull(MAP_NEWS.breaking_expire_at),
            gt(MAP_NEWS.breaking_expire_at, new Date())
          )
        )
      )
      .orderBy(desc(MAP_NEWS.created_at))

    // Send the breaking news as a JSON response
    return NextResponse.json(
      { breakingNews },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching breaking news:", error);
    return NextResponse.json(
      { message: "Error fetching breaking news", details: error.message },
      { status: 500 }
    );
  }
}