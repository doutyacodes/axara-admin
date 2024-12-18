import { db } from "@/utils";
import { NEWS_GROUP } from "@/utils/schema";
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import { and, eq, gt } from "drizzle-orm";

export async function GET(req) {
  // Authenticate user
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    // Fetch all categories from the NEWS_CATEGORIES table
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const news_count = await db
      .select()
      .from(NEWS_GROUP)
      .where(and(
        // gt(NEWS_GROUP.created_at, twentyFourHoursAgo),
        eq(NEWS_GROUP.main_news, true)
      ))
      .limit(2);

    // Send the categories as a JSON response
    return NextResponse.json(
      { news_count: news_count.length, news:news_count },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching news count:", error);
    return NextResponse.json(
      { message: "Error fetching news count", details: error.message },
      { status: 500 }
    );
  }
}
