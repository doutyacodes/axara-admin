import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import SFTPClient from 'ssh2-sftp-client';
import { NEWS, NEWS_TO_CATEGORIES } from '@/utils/schema';
import { authenticate } from '@/lib/jwtMiddleware';
import os from 'os';
import { db } from '@/utils';
import { eq } from 'drizzle-orm';

export async function POST(request) {
  const authResult = await authenticate(request, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }
  const userData = authResult.decoded_Data;
  const userId = userData.id;

  const { id, categoryId, title, description, showOnTop, image, isImageEdited, oldImage } = await request.json();

  // Define the local temp directory dynamically based on platform
  const localTempDir = os.tmpdir();

  try {
    // Step 1: Update the news fields in the NEWS table
    await db
      .update(NEWS)
      .set({
        title,
        description,
        show_on_top: showOnTop,
      })
      .where(eq(NEWS.id, id));

    // Step 2: Remove existing category mappings for this news ID in NEWS_TO_CATEGORIES
    await db
      .delete(NEWS_TO_CATEGORIES)
      .where(eq(NEWS_TO_CATEGORIES.news_id, id));

    // Step 3: Insert new category mappings into NEWS_TO_CATEGORIES
    if (Array.isArray(categoryId) && categoryId.length > 0) {
      const newMappings = categoryId.map((catId) => ({
        news_id: id,
        news_category_id: catId,
      }));

      await db.insert(NEWS_TO_CATEGORIES).values(newMappings);
    }

    let fileName = oldImage; // Default to the existing image name

    // Step 4: Handle image upload if it was edited
    if (isImageEdited) {
      const sftp = new SFTPClient();
      await sftp.connect({
        host: '68.178.163.247',
        port: 22,
        username: 'devusr',
        password: 'Wowfyuser#123',
      });

      const cPanelDirectory = '/home/devusr/public_html/testusr/images';

      // Step 4.1: Delete the old image from cPanel directory
      try {
        await sftp.delete(`${cPanelDirectory}/${oldImage}`);
        console.log(`Old image deleted successfully: ${oldImage}`);
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log(`File not found: ${oldImage}. Proceeding without deletion.`);
        } else {
          console.error(`Error deleting the file: ${error.message}`);
        }
      }

      // Step 4.2: Define a unique name for the new image
      const timestamp = Date.now();
      fileName = `${timestamp}-${id}-${title.replace(/\s+/g, '-')}.png`;

      const localFilePath = path.join(localTempDir, fileName);

      // Ensure the local temp directory exists
      if (!fs.existsSync(localTempDir)) {
        fs.mkdirSync(localTempDir, { recursive: true });
      }

      // Step 4.3: Decode base64 image and save temporarily on server
      const base64Image = image.split(';base64,').pop();
      fs.writeFileSync(localFilePath, base64Image, { encoding: 'base64' });

      // Step 4.4: Upload image to cPanel directory
      await sftp.put(localFilePath, `${cPanelDirectory}/${fileName}`);

      // Clean up temporary file
      fs.unlinkSync(localFilePath);

      // Close SFTP connection
      await sftp.end();

      // Step 4.5: Update the database with the new image URL
      const newData =  await db.select().from(NEWS).where(eq(NEWS.id,id))
      const news_group_id = newData[0].news_group_id
      await db.update(NEWS)
        .set({
          image_url: fileName,
        })
        .where(eq(NEWS.news_group_id, news_group_id));
    }

    return NextResponse.json(
      {
        message: 'News updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating news:', error);

    return NextResponse.json(
      {
        error: 'Failed to update news',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
