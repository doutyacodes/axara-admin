import { db } from "@/utils";
import { MAP_NEWS } from "@/utils/schema";
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import { eq } from "drizzle-orm";
import Client from 'ssh2-sftp-client';

// GET - Fetch a specific news item by ID
export async function GET(req, { params }) {
  // Authenticate user
  // const authResult = await authenticate(req);
  // if (!authResult.authenticated) {
  //   return authResult.response;
  // }

  const { id } = params;

  try {
    // Convert id to number and validate
    const newsId = parseInt(id);
    if (isNaN(newsId)) {
      return NextResponse.json(
        { message: "Invalid news ID" },
        { status: 400 }
      );
    }

    // Fetch the specific news item
    const newsItem = await db
      .select()
      .from(MAP_NEWS)
      .where(eq(MAP_NEWS.id, newsId))
      .limit(1);

    if (!newsItem || newsItem.length === 0) {
      return NextResponse.json(
        { message: "News item not found" },
        { status: 404 }
      );
    }

    // Send the news item as a JSON response
    return NextResponse.json(newsItem[0], { status: 200 });
  } catch (error) {
    console.error(`Error fetching news item ${id}:`, error);
    return NextResponse.json(
      { message: "Error fetching news item", details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a specific news item
export async function PUT(req, { params }) {
  // Authenticate user
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const { id } = params;

  try {
    const newsId = parseInt(id);
    if (isNaN(newsId)) {
      return NextResponse.json(
        { message: "Invalid news ID" },
        { status: 400 }
      );
    }

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
      is_high_priority,
      delete_after_hours,
      deleteOldImage,
      oldImagePath
    } = await req.json();

    // Validate required fields
    if (!title || !image_url || !article_url) {
      return NextResponse.json(
        { message: "Title, image URL, and article URL are required" },
        { status: 400 }
      );
    }

    // Check if the news item exists
    const existingNews = await db
      .select({ id: MAP_NEWS.id })
      .from(MAP_NEWS)
      .where(eq(MAP_NEWS.id, newsId))
      .limit(1);

    if (!existingNews || existingNews.length === 0) {
      return NextResponse.json(
        { message: "News item not found" },
        { status: 404 }
      );
    }

    // If requested, delete the old image from cPanel
    if (deleteOldImage && oldImagePath) {
      const sftp = new Client();
      try {
        await sftp.connect({
          host: '68.178.163.247',
          port: 22,
          username: 'devusr',
          password: 'Wowfyuser#123',
        });
        
        // Path to delete the file
        const remotePath = `/home/devusr/uploads/${oldImagePath}`;
        
        // Check if file exists before attempting to delete
        const exists = await sftp.exists(remotePath);
        if (exists) {
          await sftp.delete(remotePath);
          console.log(`Deleted old image: ${remotePath}`);
        }
      } catch (sftpError) {
        console.error('SFTP Error:', sftpError);
        // Continue with the update even if file deletion fails
      } finally {
        // Always close the connection
        await sftp.end();
      }
    }

    // Update the news item
    const updatedNews = await db.update(MAP_NEWS)
      .set({
        title,
        image_url,
        article_url,
        summary: article_text || null,
        source_name: source_name || null,
        latitude: latitude || null,
        longitude: longitude || null,
        category_id: category_id || null,
        language_id: language_id || null,
        is_high_priority,
        delete_after_hours
      })
      .where(eq(MAP_NEWS.id, newsId))

    return NextResponse.json(
      { message: "News item updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error updating news item ${id}:`, error);
    return NextResponse.json(
      { message: "Error updating news item", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a news item
export async function DELETE(req, { params }) {
  // Authenticate user
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const { id } = params;

  try {
    const newsId = parseInt(id);
    if (isNaN(newsId)) {
      return NextResponse.json(
        { message: "Invalid news ID" },
        { status: 400 }
      );
    }

    // Get the news item first to check if it exists and to get the image URL
    const newsItem = await db
      .select()
      .from(MAP_NEWS)
      .where(eq(MAP_NEWS.id, newsId))
      .limit(1);

    if (!newsItem || newsItem.length === 0) {
      return NextResponse.json(
        { message: "News item not found" },
        { status: 404 }
      );
    }

    // If the news item has an image that was uploaded (not a URL), delete it from cPanel
    const imageUrl = newsItem[0].image_url;
    if (imageUrl && !imageUrl.startsWith('http')) {
      const sftp = new Client();
      try {
        await sftp.connect({
          host: '68.178.163.247',
          port: 22,
          username: 'devusr',
          password: 'Wowfyuser#123',
        });
        
        // Path to delete the file
        const remotePath = `/home/devusr/uploads/${imageUrl}`;
        
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

    // Delete the news item
    await db
      .delete(MAP_NEWS)
      .where(eq(MAP_NEWS.id, newsId));

    return NextResponse.json(
      { message: "News item deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting news item ${id}:`, error);
    return NextResponse.json(
      { message: "Error deleting news item", details: error.message },
      { status: 500 }
    );
  }
}