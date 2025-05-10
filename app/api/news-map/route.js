import { db } from "@/utils";
import { MAP_NEWS, MAP_NEWS_CATEGORIES } from "@/utils/schema";
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import { desc, eq } from "drizzle-orm";

// GET - Fetch all news
export async function GET(req) {
  // Authenticate user
  // const authResult = await authenticate(req);
  // if (!authResult.authenticated) {
  //   return authResult.response;
  // }

  try {
    // Fetch all news items with their associated categories
    const news = await db
      .select({
        id: MAP_NEWS.id,
        title: MAP_NEWS.title,
        image_url: MAP_NEWS.image_url,
        article_url: MAP_NEWS.article_url,
        source_name: MAP_NEWS.source_name,
        latitude: MAP_NEWS.latitude,
        longitude: MAP_NEWS.longitude,
        category_id: MAP_NEWS.category_id,
        created_at: MAP_NEWS.created_at,
        category_name: MAP_NEWS_CATEGORIES.name,
      })
      .from(MAP_NEWS)
      .leftJoin(MAP_NEWS_CATEGORIES, eq(MAP_NEWS.category_id, MAP_NEWS_CATEGORIES.id))
      .orderBy(desc(MAP_NEWS.created_at));

    // Send the news items as a JSON response
    return NextResponse.json(
      { news },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { message: "Error fetching news", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new news item
export async function POST(req) {
  // Authenticate user
  // const authResult = await authenticate(req);
  // if (!authResult.authenticated) {
  //   return authResult.response;
  // }

  try {
    const {
      title,
      image_url,
      article_url,
      source_name,
      latitude,
      longitude,
      category_id,
    } = await req.json();

    // Validate required fields
    if (!title || !image_url || !article_url) {
      return NextResponse.json(
        { message: "Title, image URL, and article URL are required" },
        { status: 400 }
      );
    }

    // Create new news item
    const newNews = await db.insert(MAP_NEWS).values({
      title,
      image_url,
      article_url,
      source_name: source_name || null,
      latitude: latitude || null,
      longitude: longitude || null,
      category_id: category_id || null,
    });

    return NextResponse.json(
      { message: "News item created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating news:", error);
    return NextResponse.json(
      { message: "Error creating news", details: error.message },
      { status: 500 }
    );
  }
}