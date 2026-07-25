const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    image: {
      url: { type: String, required: [true, 'Post image is required'] },
      publicId: { type: String, required: true },
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [2200, 'Caption cannot exceed 2200 characters'],
      default: '',
    },
    hashtags: [{ type: String, lowercase: true, trim: true, index: true }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    sharesCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      // soft delete so admin moderation / audit trail is possible
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

postSchema.virtual('likesCount').get(function () {
  return this.likes?.length || 0;
});
postSchema.virtual('commentsCount').get(function () {
  return this.comments?.length || 0;
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

// Extract hashtags from caption automatically before saving
postSchema.pre('save', function (next) {
  if (this.isModified('caption')) {
    const matches = this.caption.match(/#[\w]+/g) || [];
    this.hashtags = [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
  }
  next();
});

// Feed queries are sorted by recency and filtered by isDeleted -> compound index
postSchema.index({ isDeleted: 1, createdAt: -1 });
postSchema.index({ caption: 'text' });

module.exports = mongoose.model('Post', postSchema);
