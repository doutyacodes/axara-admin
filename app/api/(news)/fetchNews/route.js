import { NextResponse } from "next/server";
import { db } from "@/utils";
import {
  ADULT_NEWS,
  NEWS_CATEGORIES,
  ADULT_NEWS_TO_CATEGORIES,
  REGIONS,
} from "@/utils/schema";
import { and, asc, desc, eq, gt, lt, or, sql } from "drizzle-orm";

export async function POST(req) {
  try {
    const { region = "India" } = await req.json();
    const Regions = await db
      .select()
      .from(REGIONS)
      .where(eq(REGIONS.name, region))
      .execute();

    let region_id = 2;

    if (Regions.length > 0) {
      region_id = Regions[0].id;
    }
    // Fetch news categories
    const newsCategories = await db
      .select()
      .from(NEWS_CATEGORIES)
      .orderBy(asc(NEWS_CATEGORIES.order_no))
      .where(
        or(
          eq(NEWS_CATEGORIES.region, "no"),
          and(
            eq(NEWS_CATEGORIES.region, "yes"),
            eq(NEWS_CATEGORIES.region_id, region_id)
          )
        )
      )
      .execute();

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
        created_at: ADULT_NEWS.created_at,
        updated_at: ADULT_NEWS.updated_at,
        news_group_id: ADULT_NEWS.news_group_id, // Include news_group_id
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
      .where(
        or(
          eq(ADULT_NEWS_TO_CATEGORIES.region_id, region_id),
          eq(ADULT_NEWS_TO_CATEGORIES.region_id, 1)
        )
      )
      .groupBy(ADULT_NEWS.id)
      .orderBy(desc(ADULT_NEWS.created_at))
      .execute();

    // Function to group news by news_group_id
    const groupByNewsGroupId = (newsData) => {
      return newsData.reduce((acc, currentNews) => {
        const { news_group_id } = currentNews;
        if (!acc[news_group_id]) {
          acc[news_group_id] = [];
        }
        acc[news_group_id].push(currentNews);
        return acc;
      }, {});
    };

    const groupedNews = groupByNewsGroupId(news);

    const groupedNewsArray = Object.keys(groupedNews).map((groupId) => ({
      news_group_id: groupId,
      newsItems: groupedNews[groupId],
    }));

    
    return NextResponse.json({
      categories: newsCategories,
      newsGroupedByGroupId: groupedNewsArray, // Return grouped normal news
    });
  } catch (error) {
    console.error("Error fetching news categories or news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news data." },
      { status: 500 }
    );
  }
}
