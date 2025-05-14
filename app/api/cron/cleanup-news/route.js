import { NextResponse } from 'next/server';
import { MAP_NEWS } from "@/utils/schema";
import { lt } from "drizzle-orm";
import { Client } from 'ssh2-sftp-client';
import { db } from '@/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  const startTime = new Date();
  console.log(`[CRON] News cleanup started at ${startTime.toISOString()}`);

  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_TOKEN}`) {
      console.warn("[CRON] Unauthorized access attempt");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all news with delete_after_hours defined
    const allNews = await db.select().from(MAP_NEWS);

    console.log(`[CRON] Total news fetched: ${allNews.length}`);

    const now = new Date();
    const newsToDelete = allNews.filter((news) => {
      const createdAt = new Date(news.created_at);
      const deleteHours = news.delete_after_hours ?? 24; // Fallback just in case
      const expiryTime = new Date(createdAt.getTime() + deleteHours * 60 * 60 * 1000);

      const shouldDelete = expiryTime < now;

      console.log(`[CRON] News ID: ${news.id}, Created: ${createdAt.toISOString()}, Expires: ${expiryTime.toISOString()}, Now: ${now.toISOString()}, Will delete: ${shouldDelete}`);
      
      return shouldDelete;
    });

    console.log(`[CRON] News items to delete: ${newsToDelete.length}`);

    let deletedCount = 0;
    let errorCount = 0;

    for (const newsItem of newsToDelete) {
      try {
        const imageUrl = newsItem.image_url;

        if (imageUrl && imageUrl.includes('testusr/images/')) {
          const filename = imageUrl.split('/').pop();
          const sftp = new Client();

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

        await db.delete(MAP_NEWS).where(lt(MAP_NEWS.id, newsItem.id));
        deletedCount++;
      } catch (itemError) {
        console.error(`[CRON] Error deleting news ID ${newsItem.id}:`, itemError);
        errorCount++;
      }
    }

    const endTime = new Date();
    console.log(`[CRON] Completed at ${endTime.toISOString()}. Deleted: ${deletedCount}, Errors: ${errorCount}`);

    return NextResponse.json({
      message: `Cleanup done. Deleted ${deletedCount} news. Errors: ${errorCount}.`,
    });
  } catch (error) {
    console.error("[CRON] Fatal error during cleanup:", error);
    return NextResponse.json(
      { message: "Fatal error during cleanup", details: error.message },
      { status: 500 }
    );
  }
}
