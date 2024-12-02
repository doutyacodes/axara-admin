import { NextResponse } from "next/server";
import { db } from "@/utils";
import { NEWS, NEWS_CATEGORIES } from "@/utils/schema";
import { authenticate } from "@/lib/jwtMiddleware";
import { eq } from "drizzle-orm";

export async function POST(req) {
  const authResult = await authenticate(req,true);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  // const userId = authResult.decoded_Data.id;
  const { age } = await req.json();


  if (!age) {
    return NextResponse.json({ error: "Age is required." }, { status: 400 });
  }

  try {
    // Fetch news categories
    const newsCategories = await db.select().from(NEWS_CATEGORIES).execute();

    // Fetch news based on the provided age
    const news = await db
      .select({
        id: NEWS.id,
        title: NEWS.title,
        description: NEWS.description,
        category: NEWS_CATEGORIES.name,
        age: NEWS.age,
        news_category_id: NEWS.news_category_id,
        image_url: NEWS.image_url, // URL of the featured image
        summary: NEWS.summary, // Brief summary, nullable
        showInHome: NEWS.show_in_home,
        created_at: NEWS.created_at, // Timestamp for record creation
        updated_at: NEWS.updated_at,
      })
      .from(NEWS)
      .leftJoin(NEWS_CATEGORIES, eq(NEWS.news_category_id, NEWS_CATEGORIES.id)) // Join on category ID
      .where(eq(NEWS.age, age))
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
