import { db } from "@/utils";
import { MAP_NEWS, MAP_NEWS_CATEGORIES } from "@/utils/schema";
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import { and, count, desc, eq, gt, isNull, or } from "drizzle-orm";
import axios from "axios";

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

// GET - Fetch all news with time remaining calculation
export async function GET(req) {
  // Authenticate user
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const adminId = userData.id;
  console.log("user id", adminId);

  try {
    // Fetch all news items with their associated categories
    const allNews = await db
      .select({
        id: MAP_NEWS.id,
        title: MAP_NEWS.title,
        image_url: MAP_NEWS.image_url,
        article_url: MAP_NEWS.article_url,
        article_text: MAP_NEWS.summary,
        source_name: MAP_NEWS.source_name,
        latitude: MAP_NEWS.latitude,
        longitude: MAP_NEWS.longitude,
        category_id: MAP_NEWS.category_id,
        created_at: MAP_NEWS.created_at,
        category_name: MAP_NEWS_CATEGORIES.name,
      })
      .from(MAP_NEWS)
      .leftJoin(MAP_NEWS_CATEGORIES, eq(MAP_NEWS.category_id, MAP_NEWS_CATEGORIES.id))
      .where(eq(MAP_NEWS.created_by, adminId))
      .orderBy(desc(MAP_NEWS.created_at));
    
    // Just add expiration info without filtering
    const newsWithExpiration = allNews.map(newsItem => {
      const createdAt = new Date(newsItem.created_at);
      const expirationTime = new Date(createdAt.getTime() + (24 * 60 * 60 * 1000));
      
      return {
        ...newsItem,
        expires_at: expirationTime.toISOString()
      };
    });
    // Optional: Clean up expired news from database ()
    /*
    const expiredNews = allNews.filter(newsItem => {
      const createdAt = new Date(newsItem.created_at);
      const expirationTime = new Date(createdAt.getTime() + (EXPIRATION_HOURS * 60 * 60 * 1000));
      return currentTime >= expirationTime;
    });

    if (expiredNews.length > 0) {
      const expiredIds = expiredNews.map(news => news.id);
      await db.delete(MAP_NEWS).where(inArray(MAP_NEWS.id, expiredIds));
      console.log(`Cleaned up ${expiredNews.length} expired news items`);
    }
    */

    // Send the active news items as a JSON response
    return NextResponse.json(
      { 
        news: newsWithExpiration,
        total: newsWithExpiration.length
      },
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
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }
  const userData = authResult.decoded_Data;
  const adminId = userData.id;

  try {
    const {
      title,
      image_url,
      article_url,
      source_name,
      article_text,
      latitude,
      longitude,
      category_id,
      language_id,
      delete_after_hours,
      is_high_priority,
      is_breaking_news,
      breaking_news_hours, 
    } = await req.json();

    if (is_breaking_news) {
      // Check if breaking news limit is exceeded
      const breakingNewsCount = await db.select({ count: count() })
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
        
      if (breakingNewsCount[0].count >= 3) {
        return NextResponse.json(
          { message: "Breaking news limit exceeded. Maximum 3 breaking news allowed." },
          { status: 400 }
        );
      }
    }

    // Validate required fields
    if (!title || !image_url || !article_url) {
      return NextResponse.json(
        { message: "Title, image URL, and article URL are required" },
        { status: 400 }
      );
    }

    // Generate AI summary
    const summary = await generateSummaryWithOpenAI(article_text);

    // Calculate breaking news expiry time
    const breakingExpireAt = is_breaking_news 
      ? new Date(Date.now() + (parseInt(breaking_news_hours) || 2) * 60 * 60 * 1000)
      : null;


    // Create new news item
    const newNews = await db.insert(MAP_NEWS).values({
      title,
      image_url,
      article_url,
      summary,
      source_name: source_name || null,
      latitude: latitude || null,
      longitude: longitude || null,
      created_by: adminId,
      category_id: category_id || null,
      language_id: language_id || null,
      delete_after_hours: delete_after_hours || 24, // with fallback to default
      is_high_priority: is_high_priority || false,
      is_breaking: is_breaking_news || false,          // Add this
      breaking_expire_at: breakingExpireAt, // Add this line
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

async function generateSummaryWithOpenAI(articleText) {
  try {
    const prompt = `
      Generate a concise news summary from the following article text. 
      The summary must be exactly between 220-230 characters (including spaces and punctuation).
      Make it engaging and informative, capturing the key points of the news.
      Return only the summary text, nothing else.
      
      Article text: ${articleText}
    `;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`Input tokens: ${response.data.usage.prompt_tokens}`);
    console.log(`Output tokens: ${response.data.usage.completion_tokens}`);
    console.log(`Total tokens: ${response.data.usage.total_tokens}`);

    let summary = response.data.choices[0].message.content.trim();
    summary = summary.replace(/```json|```/g, "").trim();
    console.log("Generated summary:", summary);
    
    return summary;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary");
  }
}