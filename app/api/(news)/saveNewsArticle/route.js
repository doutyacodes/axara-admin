import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import SFTPClient from "ssh2-sftp-client";
import { DateTime } from "luxon";
import {
  NEWS,
  NEWS_CATEGORIES,
  NEWS_GROUP,
  NEWS_QUESTIONS,
  NEWS_TO_CATEGORIES,
  WORDS_MEANINGS,
} from "@/utils/schema";
import { authenticate } from "@/lib/jwtMiddleware";
import os from "os";
import { db } from "@/utils";
import { and, eq } from "drizzle-orm";

export async function POST(request) {
  const authResult = await authenticate(request, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }
  const userData = authResult.decoded_Data;
  const userId = userData.id;

  const { result, imageData, fileName, slotId } = await request.json(); // Receive the new data structure

  const entries = Object.values(result); // Convert the data object into an array of entries

  // Define the local temp directory dynamically based on platform
  const localTempDir = os.tmpdir();

  try {
    const duplicateEntries = [];
    const allWordDefinitions = entries.flatMap(({ age, wordDefinitions }) =>
      wordDefinitions.map(({ word }) => ({ age, word }))
    );

    const filteredWordDefinitions = [];

    for (const { age, word } of allWordDefinitions) {
      const existingWords = await db
        .select()
        .from(WORDS_MEANINGS)
        .where(and(eq(WORDS_MEANINGS.word, word), eq(WORDS_MEANINGS.age, age)));

      if (existingWords.length > 0) {
        // Log duplicate entries for your reference
        duplicateEntries.push({ age, word });
      } else {
        // If not duplicate, add to the filtered list
        filteredWordDefinitions.push({ age, word });
      }
    }

    // Get the current date-time in IST using Luxon
// Get current Indian Standard Time (IST)
const formattedIndianTime = DateTime.now().setZone('Asia/Kolkata');

// Convert to plain JavaScript Date object
const indianTime = formattedIndianTime.toJSDate();

// Format the date to match SQL timestamp (YYYY-MM-DD HH:MM:SS)
const indianTimeFormatted = formattedIndianTime.toFormat('yyyy-MM-dd HH:mm:ss');

    // If slotId is valid, update the tables
    if (slotId !== null) {
      // Update NEWS_GROUP table
      await db
        .update(NEWS_GROUP)
        .set({ show_on_top: false, main_news: false })
        .where(eq(NEWS_GROUP.id, slotId));

      // Update NEWS table
      await db
        .update(NEWS)
        .set({ show_on_top: false, main_news: false })
        .where(eq(NEWS.news_group_id, slotId));
    }

    // Extract `showOnTop` and `main_news` from the first entry in `entries`
    const {
      showOnTop = false,
      main_news = false,
      region_id,
    } = entries[0] || {};

    // Insert the news group record with IST timestamps
    const newsGroupRecord = await db.insert(NEWS_GROUP).values({
      show_on_top: showOnTop,
      main_news: main_news,
      created_at: indianTime,
      updated_at: indianTime,
    });

    // Retrieve the generated group ID
    const newsGroupId = newsGroupRecord[0].insertId;

    // Iterate over each entry (article) in the data
    for (const entry of entries) {
      const {
        category,
        title,
        age,
        description,
        showOnTop,
        main_news,
        questions,
        wordDefinitions,
      } = entry;

      // Save data in NEWS table
      const newsRecord = await db.insert(NEWS).values({
        news_category_id: 8,
        title,
        image_url: `${fileName}`,
        description,
        age,
        show_on_top: main_news ? true : showOnTop,
        main_news: main_news,
        news_group_id: newsGroupId,
        created_at: indianTime,
        updated_at: indianTime,
      });

      const newsId = newsRecord[0].insertId;

      // Save each category ID in the NEWS_CATEGORIES table
      if (Array.isArray(category) && category.length > 0) {
        const categoryRecords = category.map((categoryId) => ({
          news_id: newsId,
          region_id: region_id,
          news_category_id: categoryId,
        }));

        await db.insert(NEWS_TO_CATEGORIES).values(categoryRecords);
      }

      // Save questions in NEWS_QUESTIONS table
      if (questions && questions.length > 0) {
        const questionRecords = questions.map((question) => ({
          news_id: newsId,
          questions: question.question,
        }));

        await db.insert(NEWS_QUESTIONS).values(questionRecords);
      }

      // Save word definitions in WORDS_MEANINGS table
      if (wordDefinitions && wordDefinitions.length > 0) {
        const wordDefinitionRecords = wordDefinitions.map(
          ({ word, definition }) => ({
            age,
            word,
            description: definition,
          })
        );

        await db.insert(WORDS_MEANINGS).values(wordDefinitionRecords);
      }
    }

    const sftp = new SFTPClient();
    await sftp.connect({
      host: "68.178.163.247",
      port: 22,
      username: "devusr",
      password: "Wowfyuser#123",
    });

    const localFilePath = path.join(localTempDir, fileName);
    const cPanelDirectory = "/home/devusr/public_html/testusr/images";

    // Handle file upload process
    if (!fs.existsSync(localTempDir)) {
      fs.mkdirSync(localTempDir, { recursive: true });
    }

    // Decode base64 image and save temporarily on server
    const base64Image = imageData.split(";base64,").pop();
    fs.writeFileSync(localFilePath, base64Image, { encoding: "base64" });

    // Upload image to cPanel directory
    await sftp.put(localFilePath, `${cPanelDirectory}/${fileName}`);

    // Clean up temporary file
    fs.unlinkSync(localFilePath);

    // Close SFTP connection
    await sftp.end();

    return NextResponse.json(
      {
        message: "News articles saved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading image or saving data:", error);

    return NextResponse.json(
      {
        error: "Failed to upload image and save data",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
