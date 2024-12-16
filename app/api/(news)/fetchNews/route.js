import { NextResponse } from "next/server";
import { db } from "@/utils";
import { NEWS, NEWS_CATEGORIES, NEWS_TO_CATEGORIES } from "@/utils/schema";
import { authenticate } from "@/lib/jwtMiddleware";
import { and, desc, eq, sql } from "drizzle-orm";

export async function POST(req) {
  const authResult = await authenticate(req, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  // const userId = authResult.decoded_Data.id;
  const { age, regionId } = await req.json();

  if (!age) {
    return NextResponse.json({ error: "Age is required." }, { status: 400 });
  }

  try {
    // Fetch news categories
    const newsCategories = await db.select().from(NEWS_CATEGORIES).execute();

    // // Fetch news based on the provided age
    // const news = await db
    //   .select({
    //     id: NEWS.id,
    //     title: NEWS.title,
    //     description: NEWS.description,
    //     category: NEWS_CATEGORIES.name,
    //     age: NEWS.age,
    //     news_category_id: NEWS.news_category_id,
    //     image_url: NEWS.image_url, // URL of the featured image
    //     summary: NEWS.summary, // Brief summary, nullable
    //     showOnTop: NEWS.show_on_top,
    //     created_at: NEWS.created_at, // Timestamp for record creation
    //     updated_at: NEWS.updated_at,
    //   })
    //   .from(NEWS)
    //   .leftJoin(NEWS_CATEGORIES, eq(NEWS.news_category_id, NEWS_CATEGORIES.id)) // Join on category ID
    //   .where(eq(NEWS.age, age))
    //   .orderBy(desc(NEWS.created_at)) // Order by `created_at` in descending order
    //   .execute();

    // Fetch news based on the provided age and join with the new `news_to_categories` table
    // const news = await db
    //   .select({
    //     id: NEWS.id,
    //     title: NEWS.title,
    //     description: NEWS.description,
    //     news_category_id: NEWS_TO_CATEGORIES.news_category_id,
    //     category: NEWS_CATEGORIES.name,
    //     age: NEWS.age,
    //     image_url: NEWS.image_url,
    //     summary: NEWS.summary,
    //     showOnTop: NEWS.show_on_top,
    //     created_at: NEWS.created_at,
    //     updated_at: NEWS.updated_at,
    //   })
    //   .from(NEWS)
    //   .leftJoin(
    //     NEWS_TO_CATEGORIES,
    //     eq(NEWS.id, NEWS_TO_CATEGORIES.news_id) // Join on `news_id` from `news_to_categories`
    //   )
    //   .leftJoin(
    //     NEWS_CATEGORIES,
    //     eq(NEWS_TO_CATEGORIES.news_category_id, NEWS_CATEGORIES.id) // Join on `news_category_id` from `news_to_categories`
    //   )
    //   .where(eq(NEWS.age, age))
    //   .orderBy(desc(NEWS.created_at)) // Order by `created_at` in descending order
    //   .execute();

    const news = await db
      .select({
        id: NEWS.id,
        title: NEWS.title,
        description: NEWS.description,
        categoryIds: sql`GROUP_CONCAT(${NEWS_CATEGORIES.id} SEPARATOR ',')`.as(
          "categoryIds"
        ),
        categoryNames:
          sql`GROUP_CONCAT(${NEWS_CATEGORIES.name} SEPARATOR ',')`.as(
            "categoryNames"
          ),
        age: NEWS.age,
        image_url: NEWS.image_url,
        summary: NEWS.summary,
        main_news: NEWS.main_news,
        showOnTop: NEWS.show_on_top,
        created_at: NEWS.created_at,
        updated_at: NEWS.updated_at,
      })
      .from(NEWS)
      .leftJoin(NEWS_TO_CATEGORIES, eq(NEWS.id, NEWS_TO_CATEGORIES.news_id))

      .leftJoin(
        NEWS_CATEGORIES,
        eq(NEWS_TO_CATEGORIES.news_category_id, NEWS_CATEGORIES.id)
      )
      .where(and(eq(NEWS.age, age), eq(NEWS_TO_CATEGORIES.region_id, regionId)))
      .groupBy(NEWS.id)
      .orderBy(desc(NEWS.created_at))
      .execute();

    // const processedNews = news.map((item) => ({
    //   ...item,
    //   categories: item.categoryIds ? item.categoryIds.split(',').map(Number) : [], // Category IDs
    //   categoryNames: item.categoryNames ? item.categoryNames.split(',') : [], // Category Names
    // }));

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
