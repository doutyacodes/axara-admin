// app/api/adult/upload-chunk/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Create temp directory if it doesn't exist
const TEMP_DIR = path.join(os.tmpdir(), 'uploads');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export async function POST(request) {
  try {
    const { chunk, chunkIndex, totalChunks, fileName, sessionId } = await request.json();
    
    // Create temp file path
    const tempFilePath = path.join(TEMP_DIR, `${sessionId}_${fileName}`);
    
    // Append chunk to file
    fs.appendFileSync(tempFilePath, chunk);
    
    // If this is the last chunk
    if (parseInt(chunkIndex) === parseInt(totalChunks) - 1) {
      return NextResponse.json({
        status: 'complete',
        filePath: tempFilePath
      });
    }
    
    return NextResponse.json({
      status: 'chunk-received',
      chunkIndex
    });
  } catch (error) {
    console.error('Chunk upload error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}