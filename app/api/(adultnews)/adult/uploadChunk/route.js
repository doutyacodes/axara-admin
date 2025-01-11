// app/api/adult/uploadChunk/route.js
import { NextResponse } from 'next/server';
// import { authenticate } from '@/utils/auth';
import Client from 'ssh2-sftp-client';
import { writeFile, mkdir, readdir, readFile, unlink, rm } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import os from 'os';

export const maxDuration = 300; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic';

export async function POST(request) {
//   const authResult = await authenticate(request, true);
//   if (!authResult.authenticated) {
//     return authResult.response;
//   }

  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file');
    const fileName = formData.get('fileName');
    const chunkIndex = formData.get('chunkIndex');
    const totalChunks = formData.get('totalChunks');

    if (!file || !fileName || chunkIndex === undefined || !totalChunks) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create temp directory path
    const tempDir = path.join(os.tmpdir(), 'uploads', fileName);

    // Create temp directory if it doesn't exist
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Convert File object to buffer and save chunk
    const buffer = Buffer.from(await file.arrayBuffer());
    const chunkPath = path.join(tempDir, `chunk-${chunkIndex}`);
    await writeFile(chunkPath, buffer);

    // Check if all chunks are uploaded
    const uploadedChunks = await readdir(tempDir);
    
    if (uploadedChunks.length === parseInt(totalChunks)) {
      // Combine chunks
      const finalFilePath = path.join(os.tmpdir(), fileName);
      const finalBuffer = Buffer.concat(
        await Promise.all(
          Array.from({ length: parseInt(totalChunks) }, async (_, i) => {
            const chunkContent = await readFile(path.join(tempDir, `chunk-${i}`));
            return chunkContent;
          })
        )
      );

      // Write the combined file
      await writeFile(finalFilePath, finalBuffer);

      // Upload to SFTP
      const sftp = new Client();
      
      try {
        await sftp.connect({
          host: "68.178.163.247",
          port: 22,
          username: "devusr",
          password: "Wowfyuser#123",
        });

        await sftp.put(
          finalFilePath, 
          `/home/devusr/public_html/testusr/images/${fileName}`
        );
      } finally {
        await sftp.end();
      }
      
      // Cleanup
      await rm(tempDir, { recursive: true });
      await unlink(finalFilePath);

      return NextResponse.json(
        { message: 'File uploaded successfully' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: 'Chunk uploaded successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Error processing upload', error: error.message },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};