import { NextResponse } from 'next/server';
import { MAP_NEWS } from "@/utils/schema";
import { eq, lt } from "drizzle-orm";
import { Client } from 'ssh2-sftp-client';
import { db } from '@/utils';

// Add this header to make this a protected endpoint that only Vercel cron can call
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
console.log(`Cron job started at ${new Date().toISOString()}`);

  try {
    // Verify that this request is coming from Vercel Cron
    const authHeader = req.headers.get('authorization');
    
    // Generate a secure token and store it as an environment variable in Vercel
    // Then compare it here to ensure only authorized calls can execute this function
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_TOKEN}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Calculate the cutoff dates for each delete_after_hours value
    const now = new Date();
    
    // Get all news items that are due for deletion
    const newsToDelete = await db
      .select()
      .from(MAP_NEWS)
      .where(
        lt(
          MAP_NEWS.created_at, 
          new Date(now.getTime() - (MAP_NEWS.delete_after_hours * 60 * 60 * 1000))
        )
      );

    console.log(`Found ${newsToDelete.length} news items to delete`);
    
    let deletedCount = 0;
    let errorCount = 0;
    
    // Process each news item
    for (const newsItem of newsToDelete) {
      try {
        // If the news item has an image that was uploaded to cPanel, delete it
        const imageUrl = newsItem.image_url;
        if (imageUrl && imageUrl.includes('testusr/images/')) {
          // Extract the filename from the URL
          const filename = imageUrl.split('/').pop();
          
          const sftp = new Client();
          try {
            await sftp.connect({
              host: '68.178.163.247',
              port: 22,
              username: 'devusr',
              password: 'Wowfyuser#123',
            });
            
            // Path to delete the file
            const remotePath = `/home/devusr/uploads/${filename}`;
            
            // Check if file exists before attempting to delete
            const exists = await sftp.exists(remotePath);
            if (exists) {
              await sftp.delete(remotePath);
              console.log(`Deleted image: ${remotePath}`);
            }
          } catch (sftpError) {
            console.error('SFTP Error:', sftpError);
            // Continue with the deletion even if file deletion fails
          } finally {
            // Always close the connection
            await sftp.end();
          }
        }
        
        // Delete the news item from the database
        await db
          .delete(MAP_NEWS)
          .where(eq(MAP_NEWS.id, newsItem.id));
        
        deletedCount++;
      } catch (itemError) {
        console.error(`Error deleting news item ${newsItem.id}:`, itemError);
        errorCount++;
      }
    }

    console.log(`Cron job completed: Deleted ${deletedCount} news items with ${errorCount} errors`);
    
    return NextResponse.json({
      message: `Cleanup completed. Deleted ${deletedCount} news items with ${errorCount} errors.`
    });
  } catch (error) {
    console.error("Error during news cleanup:", error);
    return NextResponse.json(
      { message: "Error during news cleanup", details: error.message },
      { status: 500 }
    );
  }
}