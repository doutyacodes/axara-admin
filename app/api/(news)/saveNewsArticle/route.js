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
  const localTempDir = os.tmpdir(); // Define the local temp directory dynamically based on platform

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
        duplicateEntries.push({ age, word });
      } else {
        filteredWordDefinitions.push({ age, word });
      }
    }

    // Get current time based on region (IST/New York)
    const indianTime = DateTime.now().setZone("Asia/Kolkata");
    const newYorkTime = DateTime.now().setZone("America/New_York");
    const indianTimeFormatted = indianTime.toFormat("yyyy-MM-dd HH:mm:ss");
    const newYorkTimeFormatted = newYorkTime.toFormat("yyyy-MM-dd HH:mm:ss");

    // Handle slotId update
    if (slotId !== null) {
      await db
        .update(NEWS_GROUP)
        .set({ show_on_top: false, main_news: false })
        .where(eq(NEWS_GROUP.id, slotId));
      await db
        .update(NEWS)
        .set({ show_on_top: false, main_news: false })
        .where(eq(NEWS.news_group_id, slotId));
    }

    const {
      showOnTop = false,
      main_news = false,
      region_id,
    } = entries[0] || {};
    console.log("region_id", region_id);
    console.log("Indian Time (Formatted):", indianTimeFormatted);
    console.log("New York Time (Formatted):", newYorkTimeFormatted);

    // Insert news group
    const newsGroupRecord = await db.insert(NEWS_GROUP).values({
      show_on_top: showOnTop,
      main_news,
      created_at:
        region_id === 3 ? newYorkTime.toJSDate() : indianTime.toJSDate(),
      updated_at:
        region_id === 3 ? newYorkTime.toJSDate() : indianTime.toJSDate(),
    });

    const newsGroupId = newsGroupRecord[0].insertId;

    // Process each entry in entries
    for (const entry of entries) {
      const { category, title, age, description, questions, wordDefinitions } =
        entry;

      const newsRecord = await db.insert(NEWS).values({
        news_category_id: 8,
        title,
        image_url: fileName,
        description,
        age,
        show_on_top: main_news || showOnTop,
        main_news,
        news_group_id: newsGroupId,
        show_date:
          region_id === 3 ? newYorkTime.toJSDate() : indianTime.toJSDate(),
        created_at:
          region_id === 3 ? newYorkTime.toJSDate() : indianTime.toJSDate(),
        updated_at:
          region_id === 3 ? newYorkTime.toJSDate() : indianTime.toJSDate(),
      });

      const newsId = newsRecord[0].insertId;

      if (Array.isArray(category) && category.length > 0) {
        const categoryRecords = category.map((categoryId) => ({
          news_id: newsId,
          region_id,
          news_category_id: categoryId,
        }));
        await db.insert(NEWS_TO_CATEGORIES).values(categoryRecords);
      }

      if (questions && questions.length > 0) {
        const questionRecords = questions.map((q) => ({
          news_id: newsId,
          questions: q.question,
        }));
        await db.insert(NEWS_QUESTIONS).values(questionRecords);
      }

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

    // Handle SFTP Upload
    const sftp = new SFTPClient();
    await sftp.connect({
      host: "68.178.163.247",
      port: 22,
      username: "devusr",
      password: "Wowfyuser#123",
    });

    const localFilePath = path.join(localTempDir, fileName);
    const cPanelDirectory = "/home/devusr/public_html/testusr/images";

    if (!fs.existsSync(localTempDir)) {
      fs.mkdirSync(localTempDir, { recursive: true });
    }

    const base64Image = imageData.split(";base64,").pop();
    fs.writeFileSync(localFilePath, base64Image, { encoding: "base64" });
    await sftp.put(localFilePath, `${cPanelDirectory}/${fileName}`);
    fs.unlinkSync(localFilePath);
    await sftp.end();

    return NextResponse.json(
      { message: "News articles saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading image or saving data:", error);
    return NextResponse.json(
      { error: "Failed to upload image and save data", details: error.message },
      { status: 500 }
    );
  }
}
