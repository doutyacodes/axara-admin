import formidable from 'formidable';

export const parseForm = async (req) => {
  const form = formidable({
    uploadDir: './uploads', // Directory to store uploaded files
    keepExtensions: true,  // Keep file extensions
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};
