import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import SFTPClient from "ssh2-sftp-client";
import { DateTime } from "luxon";
import {
  ADULT_NEWS,
  ADULT_NEWS_GROUP,
  ADULT_NEWS_TO_CATEGORIES,
} from "@/utils/schema";
import { authenticate } from "@/lib/jwtMiddleware";
import os from "os";
import { db } from "@/utils";
import { and, eq } from "drizzle-orm";

async function uploadFileToSFTP(localFilePath, fileName) {
  const sftp = new SFTPClient();
  const cPanelDirectory = "/home/devusr/public_html/testusr/images";
  
  try {
    await sftp.connect({
      host: "68.178.163.247",
      port: 22,
      username: "devusr",
      password: "Wowfyuser#123",
      readyTimeout: 30000, // 30 seconds timeout
      retries: 3, // Number of retries if connection fails
    });

    // Check if remote directory exists
    const exists = await sftp.exists(cPanelDirectory);
    if (!exists) {
      throw new Error(`Remote directory ${cPanelDirectory} does not exist`);
    }

    // Ensure local file exists
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`Local file ${localFilePath} not found`);
    }

    // Upload file
    await sftp.put(
      localFilePath, 
      `${cPanelDirectory}/${fileName}`,
      {
        mode: 0o644, // File permissions
        concurrency: 1, // Number of concurrent chunks
      }
    );

    return true;
  } catch (error) {
    console.error('SFTP Error:', error);
    throw error;
  } finally {
    try {
      await sftp.end();
    } catch (endError) {
      console.error('Error closing SFTP connection:', endError);
    }
  }
}


export async function POST(request) {
  const authResult = await authenticate(request, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.id;

  // const { result, mediaData, fileName, mediaType, slotId } = await request.json();
  const { result, mediaData, fileName, mediaType, slotId } = await request.json();

  // const { result, tempFilePath, fileName, mediaType, slotId } = await request.json();
  
  // const { result, imageData, fileName, slotId } = await request.json(); // Receive the new data structure
  const entries = Object.values(result); // Convert the data object into an array of entries

  const localTempDir = path.join(os.tmpdir(), 'uploads');
  const localFilePath = path.join(localTempDir, fileName);
  
console.log("fileName",fileName)
  try {

    // Ensure temp directory exists
    if (!fs.existsSync(localTempDir)) {
      fs.mkdirSync(localTempDir, { recursive: true });
    }

    // Write base64 data to local file
    const base64Data = mediaData.split(';base64,').pop();
    fs.writeFileSync(localFilePath, base64Data, { encoding: 'base64' });

    // Verify file was written successfully
    if (!fs.existsSync(localFilePath)) {
      throw new Error('Failed to write temporary file');
    }

    // Get file size for validation
    const stats = fs.statSync(localFilePath);
    if (stats.size === 0) {
      throw new Error('Generated file is empty');
    }

    // Upload to SFTP
    await uploadFileToSFTP(localFilePath, fileName);

    const indianTime = DateTime.now().setZone("Asia/Kolkata");
    const newYorkTime = DateTime.now().setZone("America/New_York");
    const indianTimeFormatted = indianTime.toFormat("yyyy-MM-dd HH:mm:ss");
    const newYorkTimeFormatted = newYorkTime.toFormat("yyyy-MM-dd HH:mm:ss");

    // Handle slotId update
    if (slotId !== null) {
      await db
        .update(ADULT_NEWS_GROUP)
        .set({ show_on_top: false, main_news: false })
        .where(eq(ADULT_NEWS_GROUP.id, slotId));
      await db
        .update(ADULT_NEWS)
        .set({ show_on_top: false, main_news: false })
        .where(eq(ADULT_NEWS.news_group_id, slotId));
    }

    const { showOnTop = false, main_news = false ,region_id} = entries[0] || {};

    // Insert news group
    const newsGroupRecord = await db.insert(ADULT_NEWS_GROUP).values({
      show_on_top: showOnTop,
      main_news,
      created_at: indianTime.toJSDate(),
      updated_at: indianTime.toJSDate(),
    });

    const newsGroupId = newsGroupRecord[0].insertId;

    // Process each entry in entries
    for (const entry of entries) {
      const { category, title, viewpoint, description } = entry;

      // Modify the news record insertion to include media type
      const newsRecord = await db.insert(ADULT_NEWS).values({
        news_category_id: 8,
        title,
        image_url: fileName,
        media_type: mediaType, // Add this field to your database
        description,
        viewpoint,
        show_on_top: main_news || showOnTop,
        main_news,
        news_group_id: newsGroupId,
        show_date: indianTime.toJSDate(),
        created_at: indianTime.toJSDate(),
        updated_at: indianTime.toJSDate(),
      });

      const newsId = newsRecord[0].insertId;

      if (Array.isArray(category) && category.length > 0) {
        const categoryRecords = category.map((categoryId) => ({
          news_id: newsId,
          news_category_id: categoryId,
          region_id
        }));
        await db.insert(ADULT_NEWS_TO_CATEGORIES).values(categoryRecords);
      }
    }


     // Clean up temp file
     try {
      fs.unlinkSync(localFilePath);
    } catch (cleanupError) {
      console.error('Error cleaning up temp file:', cleanupError);
      // Don't throw here as the upload was successful
    }


    // const localFilePath = path.join(localTempDir, fileName);
    // const cPanelDirectory = "/home/devusr/public_html/testusr/images";

    // if (!fs.existsSync(localTempDir)) {
    //   fs.mkdirSync(localTempDir, { recursive: true });
    // }

    // const base64Image = mediaData.split(";base64,").pop();
    // fs.writeFileSync(localFilePath, base64Image, { encoding: "base64" });
    // await sftp.put(localFilePath, `${cPanelDirectory}/${fileName}`);
    // fs.unlinkSync(localFilePath);
    // await sftp.end();

    return NextResponse.json(
      { message: "News articles saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading image or saving data:', error);
    
    // Clean up temp file if it exists
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file after failure:', cleanupError);
      }
    }

    return NextResponse.json(
      { 
        message: "Failed to upload file or save data", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// return NextResponse.json(
//   { error: "Failed to upload image and save data", details: error.message },
//   { status: 500 }
// );