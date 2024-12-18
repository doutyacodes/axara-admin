import { NextResponse } from 'next/server';
import { db } from '@/utils';
import { NEWS, NEWS_QUESTIONS } from '@/utils/schema';
import SFTPClient from 'ssh2-sftp-client';
import { eq } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function DELETE(request) {
  const authResult = await authenticate(request, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const { id } = await request.json(); // Get the news article ID from the request body
  console.log("lof g id", id)
  try {
    // Step 1: Fetch the image URL associated with the news article
    const newsRecord = await db.select({ image_url: NEWS.image_url }).from(NEWS).where(eq(NEWS.id, id)).limit(1);
    if (newsRecord.length === 0) {
      return NextResponse.json({ error: 'News article not found' }, { status: 404 });
    }

    const imageUrl = newsRecord[0].image_url;

    console.log("imageUrl", imageUrl)

    // Step 2: Set up SFTP to connect to cPanel
    const sftp = new SFTPClient();
    await sftp.connect({
      host: '68.178.163.247',
      port: 22,
      username: 'devusr',
      password: 'Wowfyuser#123',
    });

    // Step 3: Delete the image file from cPanel (sftp)
    const cPanelDirectory = '/home/devusr/public_html/testusr/images';
    await sftp.delete(`${cPanelDirectory}/${imageUrl}`);
    
    // Step 4: Disconnect from SFTP after deleting the image
    await sftp.end();

    // Step 5: Delete related questions in the NEWS_QUESTIONS table
    await db.delete(NEWS_QUESTIONS).where(eq(NEWS_QUESTIONS.news_id, id));

    // Step 6: Delete the news article from the NEWS table
    await db.delete(NEWS).where(eq(NEWS.id, id));

    return NextResponse.json({ message: 'News article and associated data deleted successfully' }, { status: 201 });

  } catch (error) {
    console.error('Error deleting news article:', error);
    return NextResponse.json({ error: 'Failed to delete news article', details: error.message }, { status: 500 });
  }
}
