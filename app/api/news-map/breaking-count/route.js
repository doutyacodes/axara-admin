import { authenticate } from "@/lib/jwtMiddleware";
import { db } from "@/utils";
import { MAP_NEWS } from "@/utils/schema";
import { and, desc, eq, gt, isNull, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    // Get count and list of breaking news
    const breakingNews = await db.select()
      .from(MAP_NEWS)
      .where(
        and(
          eq(MAP_NEWS.is_breaking, true),
          or(
            isNull(MAP_NEWS.breaking_expire_at),
            gt(MAP_NEWS.breaking_expire_at, new Date())
          )
        )
      )
      .orderBy(desc(MAP_NEWS.created_at));

    return NextResponse.json({
      count: breakingNews.length,
      breakingNews: breakingNews
    });
  } catch (error) {
    console.error("Error fetching breaking news count:", error);
    return NextResponse.json(
      { message: "Error fetching breaking news count" },
      { status: 500 }
    );
  }
}