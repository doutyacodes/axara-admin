import { NextResponse } from "next/server";
import { db } from "@/utils";
import {
  ADULT_NEWS,
  NEWS_CATEGORIES,
  ADULT_NEWS_TO_CATEGORIES,
} from "@/utils/schema";
import { authenticate } from "@/lib/jwtMiddleware";
import { and, desc, eq, sql } from "drizzle-orm";

export async function POST(req) {
  const authResult = await authenticate(req, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    // Fetch news categories
    const newsCategories = await db.select().from(NEWS_CATEGORIES).execute();

    const news = await db
      .select({
        id: ADULT_NEWS.id,
        title: ADULT_NEWS.title,
        description: ADULT_NEWS.description,
        categoryIds: sql`GROUP_CONCAT(${NEWS_CATEGORIES.id} SEPARATOR ',')`.as(
          "categoryIds"
        ),
        categoryNames:
          sql`GROUP_CONCAT(${NEWS_CATEGORIES.name} SEPARATOR ',')`.as(
            "categoryNames"
          ),
        image_url: ADULT_NEWS.image_url,
        summary: ADULT_NEWS.summary,
        main_news: ADULT_NEWS.main_news,
        showOnTop: ADULT_NEWS.show_on_top,
        created_at: ADULT_NEWS.created_at,
        updated_at: ADULT_NEWS.updated_at,
        viewpoint: ADULT_NEWS.viewpoint,
        region_id:
          sql`GROUP_CONCAT(${ADULT_NEWS_TO_CATEGORIES.region_id} SEPARATOR ',')`.as(
            "regionIds"
          ),
      })
      .from(ADULT_NEWS)
      .leftJoin(
        ADULT_NEWS_TO_CATEGORIES,
        eq(ADULT_NEWS.id, ADULT_NEWS_TO_CATEGORIES.news_id)
      )
      .leftJoin(
        NEWS_CATEGORIES,
        eq(ADULT_NEWS_TO_CATEGORIES.news_category_id, NEWS_CATEGORIES.id)
      )
      .groupBy(ADULT_NEWS.id)
      .orderBy(desc(ADULT_NEWS.created_at))
      .execute();

    return NextResponse.json({
      categories: newsCategories,
      news,
    });
  } catch (error) {
    console.error("Error fetching news categories or news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news data." },
      { status: 500 }
    );
  }
}
