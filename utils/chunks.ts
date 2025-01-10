export const splitIntoChunks = (base64String, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < base64String.length; i += chunkSize) {
    chunks.push(base64String.slice(i, i + chunkSize));
  }
  return chunks;
};
// Utility function to split base64 string into chunks