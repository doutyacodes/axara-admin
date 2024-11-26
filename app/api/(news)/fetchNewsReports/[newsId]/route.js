
import { authenticate } from "@/lib/jwtMiddleware";
import { db } from "@/utils";
import { NEWS_REPORTS } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const authResult = await authenticate(req,true);
    if (!authResult.authenticated) {
        return authResult.response;
    }

  try {
    const { newsId } = await params;

    // Fetch reports related to the news_id
    const reports = await db
      .select({
        id: NEWS_REPORTS.id,
        reportText: NEWS_REPORTS.report_text,
        createdAt: NEWS_REPORTS.created_at,
      })
      .from(NEWS_REPORTS)
      .where(eq(NEWS_REPORTS.news_id, Number(newsId)));

    return NextResponse.json(
        { reports },
        { status: 200 }
      );
  } catch (error) {
    console.error("Error fetching news reports:", error);
    return NextResponse.json(
        { error: "Failed to fetch news data." },
        { status: 500 }
      );
    }
}
