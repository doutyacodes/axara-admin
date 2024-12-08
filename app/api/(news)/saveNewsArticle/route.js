import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import SFTPClient from 'ssh2-sftp-client';
import { NEWS, NEWS_CATEGORIES, NEWS_GROUP, NEWS_QUESTIONS, NEWS_TO_CATEGORIES, WORDS_MEANINGS } from '@/utils/schema';
import { authenticate } from '@/lib/jwtMiddleware';
import os from 'os';
import { db } from '@/utils';
import { and, eq } from 'drizzle-orm';

export async function POST(request) {
  const authResult = await authenticate(request, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }
  const userData = authResult.decoded_Data;
  const userId = userData.id;

  const {result, imageData, fileName, slotId} = await request.json(); // Receive the new data structure

  // // console.log(result, fileName);
  // return NextResponse.json(
  //   {
  //     message: 'News articles saved successfully',
  //   },
  //   { status: 400 }
  // );
  
  const entries = Object.values(result); // Convert the data object into an array of entries
// console.log('entries', entries)

  // Define the local temp directory dynamically based on platform
  const localTempDir = os.tmpdir();

  try {

    const duplicateEntries = [];
    const allWordDefinitions = entries.flatMap(({ age, wordDefinitions }) =>
      wordDefinitions.map(({ word }) => ({ age, word }))
    );
    console.log("allWordDefinitions", allWordDefinitions);

    const filteredWordDefinitions = [];

    for (const { age, word } of allWordDefinitions) {
      const existingWords = await db
        .select()
        .from(WORDS_MEANINGS)
        .where(and(eq(WORDS_MEANINGS.word, word), eq(WORDS_MEANINGS.age, age)));

      if (existingWords.length > 0) {
        // Log duplicate entries for your reference
        duplicateEntries.push({ age, word });
        console.log(`Duplicate entry found: age=${age}, word=${word}`);
      } else {
        // If not duplicate, add to the filtered list
        filteredWordDefinitions.push({ age, word });
      }
    }

    // Function to get current date-time in IST
    // function getIndianTime() {
    //   const options = {
    //     timeZone: 'Asia/Kolkata',
    //     year: 'numeric',
    //     month: '2-digit',
    //     day: '2-digit',
    //     hour: '2-digit',
    //     minute: '2-digit',
    //     second: '2-digit',
    //   };
    //   const formatter = new Intl.DateTimeFormat('en-GB', options);
    //   console.log("1 ");
    //   const parts = formatter.formatToParts(new Date());
    //   console.log("2 ");
    //   const date = `${parts.find((p) => p.type === 'day').value}-${parts.find((p) => p.type === 'month').value}-${parts.find((p) => p.type === 'year').value}`;
    //   const time = `${parts.find((p) => p.type === 'hour').value}:${parts.find((p) => p.type === 'minute').value}:${parts.find((p) => p.type === 'second').value}`;
    //   console.log("3 ");
    //   return `${date} ${time}`;
    // }

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

      console.log(`Updated records for slotId: ${slotId}`);
    }


    function getIndianTime() {
      return new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    }

    // Extract `showOnTop` and `main_news` from the first entry in `entries`
    const { showOnTop = false, main_news = false } = entries[0] || {};

    // Insert the news group record with IST timestamps
    // const indianTime = getIndianTime();
    const indianTime = new Date(getIndianTime());
    console.log("indianTime", indianTime);
    const newsGroupRecord = await db.insert(NEWS_GROUP).values({
      show_on_top: showOnTop, // Use the value from the first entry
      main_news: main_news,  // Use the value from the first entry
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
      console.log("logging 1");
      
      // Save data in NEWS table
      const newsRecord = await db.insert(NEWS).values({
        news_category_id: 8,
        title,
        image_url: `${fileName}`,
        description,
        age,
        show_on_top: main_news ? true :showOnTop,
        main_news: main_news,
        news_group_id:newsGroupId,
        created_at:indianTime,
        updated_at:indianTime
      });

      const newsId = newsRecord[0].insertId;
      console.log("newsId", newsId);

      // Save each category ID in the NEWS_CATEGORIES table
      if (Array.isArray(category) && category.length > 0) {
        const categoryRecords = category.map((categoryId) => ({
          news_id: newsId,
          news_category_id: categoryId,
        }));

        await db.insert(NEWS_TO_CATEGORIES).values(categoryRecords);

        console.log("logging 3: Saved categories for newsId:", newsId);
      }

      console.log("questions", questions);
      
      // Save questions in NEWS_QUESTIONS table
      if (questions && questions.length > 0) {
        const questionRecords = questions.map((question) => ({
          news_id: newsId,
          questions: question.question,
        }));

        await db.insert(NEWS_QUESTIONS).values(questionRecords);
      }
      console.log("questions");
      // Save word definitions in WORDS_MEANINGS table
      if (wordDefinitions && wordDefinitions.length > 0) {
        const wordDefinitionRecords = wordDefinitions.map(({ word, definition }) => ({
          age,
          word,
          description: definition,
        }));

        await db.insert(WORDS_MEANINGS).values(wordDefinitionRecords);
      }
    }

    const sftp = new SFTPClient();
    await sftp.connect({
      host: '68.178.163.247',
      port: 22,
      username: 'devusr',
      password: 'Wowfyuser#123',
    });

    // Define unique file names for the images
    // const fileName = `${Date.now()}-${category}-${title.replace(/\s+/g, '-')}.png`;
    const localFilePath = path.join(localTempDir, fileName);
    const cPanelDirectory = '/home/devusr/public_html/testusr/images';

    // Handle file upload process
    if (!fs.existsSync(localTempDir)) {
      fs.mkdirSync(localTempDir, { recursive: true });
    }

    // Decode base64 image and save temporarily on server
    const base64Image = imageData.split(';base64,').pop();
    fs.writeFileSync(localFilePath, base64Image, { encoding: 'base64' });

    // Upload image to cPanel directory
    await sftp.put(localFilePath, `${cPanelDirectory}/${fileName}`);

    // Clean up temporary file
    fs.unlinkSync(localFilePath);

    // Close SFTP connection
    await sftp.end();

    return NextResponse.json(
      {
        message: 'News articles saved successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading image or saving data:', error);

    return NextResponse.json(
      {
        error: 'Failed to upload image and save data',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
