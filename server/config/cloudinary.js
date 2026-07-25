const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a file buffer (from multer memoryStorage) to Cloudinary via a stream,
 * avoiding writing temp files to disk.
 * @param {Buffer} fileBuffer
 * @param {string} folder - Cloudinary folder, e.g. 'connecthub/posts'
 * @returns {Promise<{url: string, publicId: string}>}
 */
const streamifier = require('streamifier');

const uploadBufferToCloudinary = (fileBuffer, folder = 'connecthub/misc') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Cloudinary deletion failed for ${publicId}: ${error.message}`);
  }
};

module.exports = { cloudinary, uploadBufferToCloudinary, deleteFromCloudinary };
