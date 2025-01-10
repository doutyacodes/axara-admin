import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/utils';
import { ARTICLE_INTERACTIONS, SESSIONS, VISITORS } from '@/utils/analyticsSchema';

export async function GET() {
  try {
    // Fetch total visits (count of sessions)
    const totalVisitsResult = await db
      .select({
        totalVisits: sql`COUNT(${SESSIONS.id})`,
      })
      .from(SESSIONS)
      .execute();

    const totalVisits = totalVisitsResult[0]?.totalVisits || 0;

    // Fetch unique visitors (distinct UUIDs from the VISITORS table)
    const uniqueVisitorsResult = await db
      .select({
        uniqueVisitors: sql`COUNT(DISTINCT ${VISITORS.uuid})`,
      })
      .from(VISITORS)
      .execute();

    const uniqueVisitors = uniqueVisitorsResult[0]?.uniqueVisitors || 0;3

    // Debugging: Fetch only session_end IS NOT NULL rows
    const validSessions = await db
    .select({
      sessionStart: SESSIONS.session_start,
      sessionEnd: SESSIONS.session_end,
    })
    .from(SESSIONS)
    .where(sql`${SESSIONS.session_end} IS NOT NULL`)
    .execute();

    console.log(validSessions); // Check fetched rows

    // Fetch average session duration (in seconds)
    const avgSessionDurationResult = await db
      .select({
        avgSessionDuration: sql`AVG(TIMESTAMPDIFF(SECOND, ${SESSIONS.session_start}, ${SESSIONS.session_end}))`,
      })
      .from(SESSIONS)
      .where(sql`${SESSIONS.session_end} IS NOT NULL`) // Ensure session has an end time
      .execute();

    const avgSessionDuration = avgSessionDurationResult[0]?.avgSessionDuration || 0;

    const returningVisitorsResult = await db
    .select({
      visitorId: SESSIONS.visitor_id,
      sessionCount: sql`COUNT(${SESSIONS.id})`
    })
    .from(SESSIONS)
    .innerJoin(VISITORS, eq(SESSIONS.visitor_id, VISITORS.id))
    .groupBy(SESSIONS.visitor_id)
    .having(sql`COUNT(${SESSIONS.id}) > 1`) // Ensures only those visitors with multiple sessions are counted
    .execute();

  console.log(returningVisitorsResult); // Log to verify the output

  // Now count how many distinct visitors have more than one session
  const returningVisitors = returningVisitorsResult.length;

  // Retrieve the count of returning visitors
  // const returningVisitors = returningVisitorsResult[0]?.returningVisitors || 0;

  // Fetch total shares (count of all actions in ARTICLE_INTERACTIONS)
  const totalSharesResult = await db
  .select({
    totalShares: sql`COUNT(${ARTICLE_INTERACTIONS.id})`,
  })
  .from(ARTICLE_INTERACTIONS)
  .execute();

  const totalShares = totalSharesResult[0]?.totalShares || 0;

    // Return the calculated data as JSON
    return NextResponse.json(
      {
        totalVisits,
        uniqueVisitors,
        avgSessionDuration,
        returningVisitors,
        totalShares,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 });
  }
}
