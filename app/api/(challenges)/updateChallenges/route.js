import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import SFTPClient from 'ssh2-sftp-client';
import os from 'os';
import { db } from '@/utils';
import { authenticate } from "@/lib/jwtMiddleware";
import { CHALLENGE_OPTIONS, CHALLENGE_QUESTIONS, CHALLENGES } from "@/utils/schema";


export async function PUT(request) {
    const authResult = await authenticate(request, true);
    if (!authResult.authenticated) {
      return authResult.response;
    }
  
    const { challengeId, title, description, show_date, challenge_type, image, oldImageName, entry_type, entry_fee, age, questions } = await request.json();
  
    const localTempDir = os.tmpdir(); // Temporary directory for file operations
    const cPanelDirectory = '/home/devusr/public_html/testusr/images'; // Remote directory
  
    try {
        let updatedImageName = oldImageName;

        // Handle image update logic
        if (image && image.startsWith('data:image')) { 
          // New image is a base64 string
          console.log("Uploading new image...");
        
          const fileName = `${Date.now()}-${challenge_type}-${title.replace(/\s+/g, '-')}.png`;
          const base64Image = image.split(';base64,').pop();
          const localFilePath = path.join(localTempDir, fileName);
        
          try {
            
            // Save new image locally
            fs.writeFileSync(localFilePath, base64Image, { encoding: 'base64' });
        
            // Connect to SFTP
            const sftp = new SFTPClient();
            await sftp.connect({
              host: '68.178.163.247',
              port: 22,
              username: 'devusr',
              password: 'Wowfyuser#123',
            });
        
            // Delete old image if it exists
            if (oldImageName) {
              try {
                await sftp.delete(`${cPanelDirectory}/${oldImageName}`);
                console.log("Old image deleted successfully.");
              } catch (error) {
                console.warn('Could not delete old image (might not exist):', error.message);
              }
            }
        
            // Upload new image
            await sftp.put(localFilePath, `${cPanelDirectory}/${fileName}`);
            console.log("New image uploaded successfully.");
            updatedImageName = fileName;
            // Clean up local file
            fs.unlinkSync(localFilePath);

            // Close SFTP connection
            await sftp.end();
        
          } catch (error) {
            console.error('Error processing the image upload:', error.message);
            // Optionally rethrow or handle the error gracefully based on your API logic
            throw error;
          }
        } else {
          // Existing image is just a filename; no upload necessary
          console.log("Using existing image:", updatedImageName);
        }
  
      // Update challenge data
      await db.update(CHALLENGES).set({
        title,
        description,
        show_date,
        challenge_type,
        // slug: updatedImageName,
        image: updatedImageName,
        entry_type,
        entry_fee: entry_type || null,
        age,
      }).where({ id: challengeId });
      // Handle questions and options
      const existingQuestionIds = questions.map((q) => q.id);
    //   const dbQuestionIds = await db.select({ id: CHALLENGE_QUESTIONS.id }).from(CHALLENGE_QUESTIONS).where({ challenge_id: challengeId });
    const dbQuestionIds = await db.select({ id: CHALLENGE_QUESTIONS.id }).from(CHALLENGE_QUESTIONS).where({ challenge_id: challengeId });
    const toDeleteQuestionIds = dbQuestionIds
    .filter((q) => !existingQuestionIds.includes(q.id))
    .map(q => q.id);

    if (toDeleteQuestionIds.length > 0) {
        await db.delete(CHALLENGE_OPTIONS).where('question_id', 'in', toDeleteQuestionIds);
        await db.delete(CHALLENGE_QUESTIONS).where('id', 'in', toDeleteQuestionIds);
    }

      // Update or insert questions and options
      for (const { id, question, options, correctOption } of questions) {
        if (id) {
          // Update existing question
          await db.update(CHALLENGE_QUESTIONS).set({ question }).where({ id });
          await db.delete(CHALLENGE_OPTIONS).where({ question_id: id }); // Clear old options
          const optionRecords = options.map((option, index) => ({
            challenge_id: challengeId,
            question_id: id,
            option,
            is_correct: index === correctOption,
          }));
          await db.insert(CHALLENGE_OPTIONS).values(optionRecords);
        } else {
          // Insert new question
          const questionRecord = await db.insert(CHALLENGE_QUESTIONS).values({ challenge_id: challengeId, question });
          const questionId = questionRecord[0].insertId;
  
          const optionRecords = options.map((option, index) => ({
            challenge_id: challengeId,
            question_id: questionId,
            option,
            is_correct: index === correctOption,
          }));
          await db.insert(CHALLENGE_OPTIONS).values(optionRecords);
        }
      }

      return NextResponse.json({ message: 'Challenge updated successfully' }, { status: 200 });
    } catch (error) {
      console.error('Error updating challenge:', error);
      return NextResponse.json({ error: 'Failed to update challenge', details: error.message }, { status: 500 });
    }
  }
  