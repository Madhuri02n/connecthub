const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Use memory storage so the buffer can be streamed straight to Cloudinary
// without ever touching Render's ephemeral disk.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError('Only JPEG, PNG, WEBP and GIF images are allowed', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB
  },
});

module.exports = upload;
