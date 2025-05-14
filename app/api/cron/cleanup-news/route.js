import { NextResponse } from 'next/server';
import { MAP_NEWS } from "@/utils/schema";
import { eq, and, lt } from "drizzle-orm";
import SFTPClient from 'ssh2-sftp-client';
import { db } from '@/utils';

// To test this 
// curl -H "Authorization: Bearer 6fd7e23c-a4b2-4e39-9cb8-c23fb8e6b511" https://axara-admin.vercel.app/api/cron/cleanup-news

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  const cronStartTime = new Date().toISOString();
  console.log(`[CRON] Started at ${cronStartTime}`);

  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_TOKEN}`) {
      console.warn('[CRON] Unauthorized attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Fetch all news entries with expired time
    const allNews = await db.select().from(MAP_NEWS);
    const expiredNews = allNews.filter(news => {
      const deleteAfter = news.delete_after_hours ?? 24;
      const expirationTime = new Date(news.created_at.getTime() + deleteAfter * 60 * 60 * 1000);
      return expirationTime <= now;
    });

    console.log(`[CRON] Found ${expiredNews.length} news items to delete`);

    let deletedCount = 0;
    let errorCount = 0;

    for (const newsItem of expiredNews) {
      try {
        const imageUrl = newsItem.image_url;
        if (imageUrl?.includes('testusr/images/')) {
          const filename = imageUrl.split('/').pop();
          const sftp = new SFTPClient(); // ✅ Use correct constructor

          try {
            await sftp.connect({
              host: '68.178.163.247',
              port: 22,
              username: 'devusr',
              password: 'Wowfyuser#123',
            });

            const remotePath = `/home/devusr/uploads/${filename}`;
            const exists = await sftp.exists(remotePath);
            if (exists) {
              await sftp.delete(remotePath);
              console.log(`[CRON] Deleted image: ${remotePath}`);
            } else {
              console.log(`[CRON] Image not found: ${remotePath}`);
            }
          } catch (sftpError) {
            console.error(`[CRON] SFTP error for news ID ${newsItem.id}:`, sftpError);
          } finally {
            await sftp.end();
          }
        }

        await db.delete(MAP_NEWS).where(eq(MAP_NEWS.id, newsItem.id));
        console.log(`[CRON] Deleted news ID ${newsItem.id}`);
        deletedCount++;
      } catch (itemError) {
        console.error(`[CRON] Error deleting news ID ${newsItem.id}:`, itemError);
        errorCount++;
      }
    }

    const endTime = new Date().toISOString();
    console.log(`[CRON] Completed at ${endTime}. Deleted: ${deletedCount}, Errors: ${errorCount}`);

    return NextResponse.json({
      message: `Cleanup completed. Deleted ${deletedCount} news items with ${errorCount} errors.`,
    });
  } catch (error) {
    console.error("[CRON] Fatal error during cleanup:", error);
    return NextResponse.json(
      { message: "Error during news cleanup", details: error.message },
      { status: 500 }
    );
  }
}
