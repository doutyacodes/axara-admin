// frontend/utils/uploadHelpers.js
export const chunkFile = (file, chunkSize = 1024 * 1024 * 2) => { // 2MB chunks
    const chunks = [];
    let offset = 0;
    
    while (offset < file.size) {
      chunks.push(file.slice(offset, offset + chunkSize));
      offset += chunkSize;
    }
    
    return chunks;
  };
  