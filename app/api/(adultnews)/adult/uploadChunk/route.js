// app/api/adult/uploadChunk/route.js
// import { NextResponse } from 'next/server';
// // import { authenticate } from '@/utils/auth';
// import Client from 'ssh2-sftp-client';
// import { writeFile, mkdir, readdir, readFile, unlink, rm } from 'fs/promises';
// import { existsSync } from 'fs';
// import path from 'path';
// import os from 'os';

// export const maxDuration = 300; // This function can run for a maximum of 5 seconds
// export const dynamic = 'force-dynamic';

// export async function POST(request) {
// //   const authResult = await authenticate(request, true);
// //   if (!authResult.authenticated) {
// //     return authResult.response;
// //   }

//   try {
//     // Parse the multipart form data
//     const formData = await request.formData();
//     const file = formData.get('file');
//     const fileName = formData.get('fileName');
//     const chunkIndex = formData.get('chunkIndex');
//     const totalChunks = formData.get('totalChunks');

//     if (!file || !fileName || chunkIndex === undefined || !totalChunks) {
//       return NextResponse.json(
//         { message: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     // Create temp directory path
//     const tempDir = path.join(os.tmpdir(), 'uploads', fileName);

//     // Create temp directory if it doesn't exist
//     if (!existsSync(tempDir)) {
//       await mkdir(tempDir, { recursive: true });
//     }

//     // Convert File object to buffer and save chunk
//     const buffer = Buffer.from(await file.arrayBuffer());
//     const chunkPath = path.join(tempDir, `chunk-${chunkIndex}`);
//     await writeFile(chunkPath, buffer);

//     // Check if all chunks are uploaded
//     const uploadedChunks = await readdir(tempDir);
    
//     if (uploadedChunks.length === parseInt(totalChunks)) {
//       // Combine chunks
//       const finalFilePath = path.join(os.tmpdir(), fileName);
//       const finalBuffer = Buffer.concat(
//         await Promise.all(
//           Array.from({ length: parseInt(totalChunks) }, async (_, i) => {
//             const chunkContent = await readFile(path.join(tempDir, `chunk-${i}`));
//             return chunkContent;
//           })
//         )
//       );

//       // Write the combined file
//       await writeFile(finalFilePath, finalBuffer);

//       // Upload to SFTP
//       const sftp = new Client();
      
//       try {
//         await sftp.connect({
//           host: "68.178.163.247",
//           port: 22,
//           username: "devusr",
//           password: "Wowfyuser#123",
//         });

//         await sftp.put(
//           finalFilePath, 
//           `/home/devusr/public_html/testusr/images/${fileName}`
//         );
//       } finally {
//         await sftp.end();
//       }
      
//       // Cleanup
//       await rm(tempDir, { recursive: true });
//       await unlink(finalFilePath);

//       return NextResponse.json(
//         { message: 'File uploaded successfully' },
//         { status: 200 }
//       );
//     }

//     return NextResponse.json(
//       { message: 'Chunk uploaded successfully' },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error('Upload error:', error);
//     return NextResponse.json(
//       { message: 'Error processing upload', error: error.message },
//       { status: 500 }
//     );
//   }
// }

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// app/api/adult/uploadChunk/route.js
import { NextResponse } from 'next/server';
import Client from 'ssh2-sftp-client';
import { writeFile, mkdir, readdir, readFile, unlink, rm } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import os from 'os';

export const maxDuration = 300; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic';

// Helper function to combine chunks
async function combineChunks(tempDir, totalChunks) {
  const chunks = [];
  for (let i = 0; i < parseInt(totalChunks); i++) {
    const chunkContent = await readFile(path.join(tempDir, `chunk-${i}`));
    chunks.push(chunkContent);
  }
  return Buffer.concat(chunks);
}

// Helper function to upload via SFTP
async function uploadToSFTP(filePath, fileName) {
  const sftp = new Client();
  try {
    await sftp.connect({
      host: "68.178.163.247",
      port: 22,
      username: "devusr",
      password: "Wowfyuser#123",
      readyTimeout: 5000, // 5 second timeout for connection
    });

    await sftp.put(
      filePath,
      `/home/devusr/public_html/testusr/images/${fileName}`,
      {
        step: (transferred, chunk, total) => {
          if (transferred === total) {
            console.log('Upload complete');
          }
        }
      }
    );
  } finally {
    await sftp.end();
  }
}

export async function POST(request) {
  try {
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

    // Create temp directory path with unique identifier
    const fileId = fileName.split('.')[0];
    const tempDir = path.join(os.tmpdir(), 'uploads', fileId);

    // Create temp directory if it doesn't exist
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Save the chunk
    const buffer = Buffer.from(await file.arrayBuffer());
    const chunkPath = path.join(tempDir, `chunk-${chunkIndex}`);
    await writeFile(chunkPath, buffer);

    // Check uploaded chunks
    const uploadedChunks = await readdir(tempDir);
    
    // If this is the last chunk
    if (uploadedChunks.length === parseInt(totalChunks)) {
      try {
        // Process in smaller chunks to avoid timeout
        const finalFilePath = path.join(os.tmpdir(), fileName);
        
        // Combine chunks with smaller reads
        const finalBuffer = await combineChunks(tempDir, totalChunks);
        await writeFile(finalFilePath, finalBuffer);

        // Upload file
        await uploadToSFTP(finalFilePath, fileName);

        // Cleanup
        setTimeout(async () => {
          try {
            await rm(tempDir, { recursive: true, force: true });
            await unlink(finalFilePath);
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
          }
        }, 1000);

        return NextResponse.json(
          { message: 'File uploaded successfully' },
          { status: 200 }
        );
      } catch (error) {
        // Cleanup on error
        try {
          await rm(tempDir, { recursive: true, force: true });
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
        throw error;
      }
    }

    return NextResponse.json(
      { 
        message: 'Chunk uploaded successfully',
        progress: {
          uploadedChunks: uploadedChunks.length,
          totalChunks: parseInt(totalChunks)
        }
      },
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