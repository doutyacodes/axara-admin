import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import SFTPClient from 'ssh2-sftp-client';
import os from 'os';
import { db } from '@/utils';
import { authenticate } from '@/lib/jwtMiddleware';
import { CHALLENGES, CHALLENGE_QUESTIONS, CHALLENGE_OPTIONS } from '@/utils/schema';

export async function POST(request) {
  const authResult = await authenticate(request, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.id;

  const { title, description, show_date, challenge_type, image, entry_type, entry_fee, age, questions } = await request.json();

  // Define the local temp directory dynamically based on platform
  const localTempDir = os.tmpdir();

  try {
    // Generate unique file name for the image
    const fileName = `${Date.now()}-${challenge_type}-${title.replace(/\s+/g, '-')}.png`;

    // Decode base64 image and save temporarily
    const base64Image = image.split(';base64,').pop();
    const localFilePath = path.join(localTempDir, fileName);
    fs.writeFileSync(localFilePath, base64Image, { encoding: 'base64' });

    // Save challenge data in CHALLENGES table
    const challengeRecord = await db.insert(CHALLENGES).values({
      title,
      description,
      show_date,
      challenge_type,
      slug: fileName, // Assuming slug is the file name
      image: fileName,
      entry_type,
      // entry_fee: entry_type === 'fee' ? entry_fee : null, // Insert entry_fee only if entry_type is 'fee'
      entry_fee: entry_type === 'fee' || entry_type === 'points' ? entry_fee : null,
      age,
    });

    const challengeId = challengeRecord[0].insertId;

    // Insert questions and options if provided
    if (questions && questions.length > 0) {
      for (const { question, options, correctOption  } of questions) {
        const questionRecord = await db.insert(CHALLENGE_QUESTIONS).values({
          challenge_id: challengeId,
          question,
        });

        const questionId = questionRecord[0].insertId;

        if (options && options.length > 0) {
          const optionRecords = options.map((option, index) => ({
            challenge_id: challengeId,
            question_id: questionId,
            option,
            is_answer: index === correctOption, // Set true for the correct option
          }));
          await db.insert(CHALLENGE_OPTIONS).values(optionRecords);
        }
      }
    }

    // Upload image to SFTP server
    const sftp = new SFTPClient();
    await sftp.connect({
      host: '68.178.163.247',
      port: 22,
      username: 'devusr',
      password: 'Wowfyuser#123',
    });

    const cPanelDirectory = '/home/devusr/public_html/testusr/images';
    await sftp.put(localFilePath, `${cPanelDirectory}/${fileName}`);

    // Clean up local file
    fs.unlinkSync(localFilePath);

    // Close SFTP connection
    await sftp.end();

    return NextResponse.json(
      {
        message: 'Challenge created successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating challenge:', error);

    return NextResponse.json(
      {
        error: 'Failed to create challenge',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
