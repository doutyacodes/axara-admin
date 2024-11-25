import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import SFTPClient from 'ssh2-sftp-client';
import { NEWS, NEWS_QUESTIONS, WORDS_MEANINGS } from '@/utils/schema';
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

  const {result, imageData, fileName} = await request.json(); // Receive the new data structure

  // console.log(result, fileName);
  
  
  const entries = Object.values(result); // Convert the data object into an array of entries
// console.log('entries', entries)

  // Define the local temp directory dynamically based on platform
  const localTempDir = os.tmpdir();

  try {

    // First: Collect duplicate words across all entries
    const duplicateEntries = [];
    const allWordDefinitions = entries.flatMap(({ age, wordDefinitions }) =>
      wordDefinitions.map(({ word }) => ({ age, word }))
    );
    console.log("allWordDefinitions", allWordDefinitions);
    
    for (const { age, word } of allWordDefinitions) {
      const existingWords = await db
      .select()
      .from(WORDS_MEANINGS)
      .where(and(eq(WORDS_MEANINGS.word, word), eq(WORDS_MEANINGS.age, age)));

      if (existingWords.length > 0) {
        duplicateEntries.push({ age, word });
      }
    }

    // If any duplicates are found, respond with the duplicate information
    if (duplicateEntries.length > 0) {
      const duplicateAges = [...new Set(duplicateEntries.map((entry) => entry.age))];
      const duplicateWords = [...new Set(duplicateEntries.map((entry) => entry.word))];

      return NextResponse.json(
        {
          message: "Word Definitions already present for certain age groups.",
          duplicateAges,
          duplicateWords,
        },
        { status: 400 }
      );
    }

    // Iterate over each entry (article) in the data
    for (const entry of entries) {
      const {
        category,
        title,
        age,
        // summary,
        description,
        showInHome,
        questions,
        wordDefinitions,
      } = entry;
      console.log("logging 1");
      
      // Save data in NEWS table
      const newsRecord = await db.insert(NEWS).values({
        news_category_id: category,
        title,
        image_url: `${fileName}`,
        description,
        age,
        show_in_home: showInHome,
      });

      const newsId = newsRecord[0].insertId;
      console.log("newsId", newsId);

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
