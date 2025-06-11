import { db } from "@/utils";
import { MAP_NEWS, MAP_NEWS_CATEGORIES } from "@/utils/schema";
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import { desc, eq } from "drizzle-orm";
import axios from "axios";

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

// GET - Fetch all news
export async function GET(req) {
  // Authenticate user
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const adminId = userData.id;
  console.log("user id", adminId)

  try {
    // Fetch all news items with their associated categories
    const news = await db
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
    } = await req.json();

    // Validate required fields
    if (!title || !image_url || !article_url) {
      return NextResponse.json(
        { message: "Title, image URL, and article URL are required" },
        { status: 400 }
      );
    }

    // Generate AI summary
    const summary = await generateSummaryWithOpenAI(article_text);


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