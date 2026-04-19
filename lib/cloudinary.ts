import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(file: Buffer, fileName: string): Promise<string> {
  if (!process.env.CLOUDINARY_API_KEY) {
    console.warn('Cloudinary keys missing, skipping remote upload');
    return '';
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: 'study-smart',
        resource_type: 'auto',
        public_id: fileName.replace(/\.[^/.]+$/, "") 
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url || '');
      }
    );
    uploadStream.end(file);
  });
}
