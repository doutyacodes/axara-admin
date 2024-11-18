import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import SFTPClient from 'ssh2-sftp-client';
import { NEWS, NEWS_QUESTIONS, WORDS_MEANINGS } from '@/utils/schema';
import { authenticate } from '@/lib/jwtMiddleware';
import os from 'os';
import { db } from '@/utils';

export async function POST(request) {
  const authResult = await authenticate(request, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }
  const userData = authResult.decoded_Data;
  const userId = userData.id;
  console.log('userId', userId)

  const {
    categoryId,
    title,
    summary,
    description,
    age,
    showInHome,
    questions,
    image,
    wordDefinitions,
  } = await request.json();
  
  console.log(categoryId, title, summary, description, age, showInHome, questions, wordDefinitions )

  // Define the local temp directory dynamically based on platform
  const localTempDir = os.tmpdir();
  const fileName = `${Date.now()}-${categoryId}-${age}.png`;
  const localFilePath = path.join(localTempDir, fileName);
  const cPanelDirectory = '/home/devusr/public_html/testusr/images';

  try {
    if (!fs.existsSync(localTempDir)) {
      fs.mkdirSync(localTempDir, { recursive: true });
    }

    // Decode base64 image and save temporarily on server
    const base64Image = image.split(';base64,').pop();
    fs.writeFileSync(localFilePath, base64Image, { encoding: 'base64' });

    // SFTP Connection details
    const sftp = new SFTPClient();
    await sftp.connect({
      host: '68.178.163.247',
      port: 22,
      username: 'devusr',
      password: 'Wowfyuser#123',
    });

    // Upload image to cPanel directory
    await sftp.put(localFilePath, `${cPanelDirectory}/${fileName}`);
    await sftp.end();

    // Save data in NEWS table
    const newsRecord = await db.insert(NEWS).values({
      news_category_id: categoryId,
      title,
      image_url: `${fileName}`,
      summary,
      description,
      age,
    });

    const newsId = newsRecord[0].insertId
  // Save questions in NEWS_QUESTIONS table
  if (questions && questions.length > 0) {
    const questionRecords = questions.map((question) => ({
      news_id: newsId,
      questions: question,
    }));

    await db.insert(NEWS_QUESTIONS).values(questionRecords);
  }

  // Save word definitions in WORDS_MEANINGS table
  if (wordDefinitions && wordDefinitions.length > 0) {
    const wordDefinitionRecords = wordDefinitions.map(({ word, definition }) => ({
      news_id: newsId,
      word,
      description: definition,
    }));

    await db.insert(WORDS_MEANINGS).values(wordDefinitionRecords);
  }

  // Clean up temporary file
  fs.unlinkSync(localFilePath);

  return NextResponse.json(
    {
      message: 'News article saved successfully',
      newsId,
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
