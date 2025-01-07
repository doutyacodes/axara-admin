import { db } from "@/utils";
import { PERSPECTIVE_VIEWS, SESSIONS, VISITORS } from "@/utils/analyticsSchema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = await params; // Extract article ID from params

    if (!id) {
      return NextResponse.json({ error: "Article ID is required." }, { status: 400 });
    }

    // Fetch unique views by visitors (track unique visitors, regardless of sessions)
    const uniqueViewsResult = await db
    .select({
        uniqueViews: sql`COUNT(DISTINCT ${VISITORS.id})`, // Use visitor_id to calculate unique visitors
    })
    .from(PERSPECTIVE_VIEWS)
    .innerJoin(SESSIONS, eq(PERSPECTIVE_VIEWS.session_id, SESSIONS.id)) // Join with the SESSIONS table using session_id
    .innerJoin(VISITORS, eq(SESSIONS.visitor_id, VISITORS.id)) // Join with the VISITORS table to track unique visitors
    .where(eq(PERSPECTIVE_VIEWS.article_id, id))
    .execute();

    const uniqueViews = uniqueViewsResult[0]?.uniqueViews || 0;

    // Fetch total views and engagement time
    const totalMetricsResult = await db
    .select({
        totalViews: sql`SUM(${PERSPECTIVE_VIEWS.views})`,
        totalEngagementTime: sql`SUM(${PERSPECTIVE_VIEWS.engagement_time})`,
    })
    .from(PERSPECTIVE_VIEWS)
    .where(eq(PERSPECTIVE_VIEWS.article_id, id))
    .execute();

    const totalViews = totalMetricsResult[0]?.totalViews || 0;
    const totalEngagementTime = totalMetricsResult[0]?.totalEngagementTime || 0;

    // Calculate average engagement time per view
    const avgEngagementTimePerView = totalViews > 0 ? totalEngagementTime / totalViews : 0;

    // Calculate average views per user
    const avgViewsPerUser = uniqueViews > 0 ? totalViews / uniqueViews : 0;

    // Fetch returning user count (based on unique visitors who have returned to view the article more than once)
    const returningUsersResult = await db
    .select({
        returningUsers: sql`COUNT(DISTINCT ${VISITORS.id})`, // Count returning visitors based on visitor_id
    })
    .from(PERSPECTIVE_VIEWS)
    .innerJoin(SESSIONS, eq(PERSPECTIVE_VIEWS.session_id, SESSIONS.id)) // Join with the SESSIONS table using session_id
    .innerJoin(VISITORS, eq(SESSIONS.visitor_id, VISITORS.id)) // Join with the VISITORS table
    .where(
        eq(PERSPECTIVE_VIEWS.article_id, id),
        sql`EXISTS (
        SELECT 1 FROM ${PERSPECTIVE_VIEWS} pv2
        WHERE pv2.article_id = ${PERSPECTIVE_VIEWS.article_id}
        AND pv2.session_id = ${PERSPECTIVE_VIEWS.session_id}
        GROUP BY pv2.session_id
        HAVING COUNT(*) > 1
        )`
    )
    .execute();

    const returningUsers = returningUsersResult[0]?.returningUsers || 0;

    // Return the calculated data
    return NextResponse.json(
    {
        uniqueViews,
        avgEngagementTimePerView,
        avgViewsPerUser,
        returningUsers,
    },
    { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching perspective data:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
