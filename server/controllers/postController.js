const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get paginated feed of posts
// @route   GET /api/posts?page=1&limit=10
// @access  Public (optionalAuth so we can flag isLiked/isBookmarked)
const getPosts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const skip = (page - 1) * limit;

  const filter = { isDeleted: false };

  // Optional: restrict the feed to a single author's posts, e.g. for a
  // profile page (`GET /api/posts?author=someusername`).
  if (req.query.author) {
    const User = require('../models/User');
    const authorUser = await User.findOne({ username: req.query.author.toLowerCase() }).select('_id');
    if (!authorUser) {
      return res.status(200).json({
        success: true,
        posts: [],
        pagination: { page, limit, total: 0, totalPages: 0, hasMore: false },
      });
    }
    filter.author = authorUser._id;
  }

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name username profilePicture')
      .lean(),
    Post.countDocuments(filter),
  ]);

  const withFlags = posts.map((post) => ({
    ...post,
    likesCount: post.likes?.length || 0,
    commentsCount: post.comments?.length || 0,
    isLiked: req.user ? post.likes.some((id) => String(id) === String(req.user._id)) : false,
    isBookmarked: req.user ? req.user.bookmarks.some((id) => String(id) === String(post._id)) : false,
  }));

  res.status(200).json({
    success: true,
    posts: withFlags,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + posts.length < total,
    },
  });
});

// @desc    Get a single post by id
// @route   GET /api/posts/:id
// @access  Public
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, isDeleted: false })
    .populate('author', 'name username profilePicture')
    .populate({
      path: 'comments',
      populate: { path: 'user', select: 'name username profilePicture' },
      options: { sort: { createdAt: -1 } },
    });

  if (!post) throw new ApiError('Post not found', 404);

  res.status(200).json({ success: true, post });
});

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError('An image is required to create a post', 400);

  const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer, 'connecthub/posts');

  const post = await Post.create({
    author: req.user._id,
    image: { url, publicId },
    caption: req.body.caption || '',
  });

  await post.populate('author', 'name username profilePicture');

  res.status(201).json({ success: true, post });
});

// @desc    Edit a post's caption (author only)
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.isDeleted) throw new ApiError('Post not found', 404);

  if (String(post.author) !== String(req.user._id)) {
    throw new ApiError('You can only edit your own posts', 403);
  }

  if (req.body.caption !== undefined) post.caption = req.body.caption;
  await post.save(); // triggers hashtag re-extraction

  res.status(200).json({ success: true, post });
});

// @desc    Delete a post (author or admin only) - soft delete
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.isDeleted) throw new ApiError('Post not found', 404);

  const isOwner = String(post.author) === String(req.user._id);
  if (!isOwner && !req.user.isAdmin) {
    throw new ApiError('You can only delete your own posts', 403);
  }

  post.isDeleted = true;
  await post.save();

  // Best-effort cleanup of the Cloudinary asset; failures are logged, not thrown
  await deleteFromCloudinary(post.image.publicId);

  res.status(200).json({ success: true, message: 'Post deleted successfully' });
});

// @desc    Like a post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.isDeleted) throw new ApiError('Post not found', 404);

  const alreadyLiked = post.likes.some((id) => String(id) === String(req.user._id));
  if (alreadyLiked) throw new ApiError('You already liked this post', 409);

  post.likes.push(req.user._id);
  await post.save();

  if (String(post.author) !== String(req.user._id)) {
    await Notification.create({
      sender: req.user._id,
      receiver: post.author,
      type: 'like',
      post: post._id,
    });
    const io = req.app.get('io');
    if (io) io.to(String(post.author)).emit('notification', { type: 'like', from: req.user.username, postId: post._id });
  }

  res.status(200).json({ success: true, likesCount: post.likes.length });
});

// @desc    Unlike a post
// @route   POST /api/posts/:id/unlike
// @access  Private
const unlikePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.isDeleted) throw new ApiError('Post not found', 404);

  post.likes = post.likes.filter((id) => String(id) !== String(req.user._id));
  await post.save();

  res.status(200).json({ success: true, likesCount: post.likes.length });
});

// @desc    Comment on a post
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.isDeleted) throw new ApiError('Post not found', 404);

  const comment = await Comment.create({
    user: req.user._id,
    post: post._id,
    text: req.body.text,
  });

  post.comments.push(comment._id);
  await post.save();
  await comment.populate('user', 'name username profilePicture');

  if (String(post.author) !== String(req.user._id)) {
    await Notification.create({
      sender: req.user._id,
      receiver: post.author,
      type: 'comment',
      post: post._id,
    });
    const io = req.app.get('io');
    if (io) io.to(String(post.author)).emit('notification', { type: 'comment', from: req.user.username, postId: post._id });
  }

  res.status(201).json({ success: true, comment });
});

// @desc    Delete own comment
// @route   DELETE /api/posts/:postId/comment/:commentId
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError('Comment not found', 404);

  if (String(comment.user) !== String(req.user._id)) {
    throw new ApiError('You can only delete your own comments', 403);
  }

  await Comment.findByIdAndDelete(commentId);
  await Post.findByIdAndUpdate(postId, { $pull: { comments: commentId } });

  res.status(200).json({ success: true, message: 'Comment deleted' });
});

// @desc    Increment share count (share tracking; actual sharing is a
//          client-side action - copy link / native share sheet)
// @route   POST /api/posts/:id/share
// @access  Private
const sharePost = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $inc: { sharesCount: 1 } },
    { new: true }
  );
  if (!post) throw new ApiError('Post not found', 404);

  res.status(200).json({ success: true, sharesCount: post.sharesCount });
});

// @desc    Toggle bookmark on a post
// @route   POST /api/posts/:id/bookmark
// @access  Private
const toggleBookmark = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const post = await Post.findById(postId);
  if (!post || post.isDeleted) throw new ApiError('Post not found', 404);

  const isBookmarked = req.user.bookmarks.some((id) => String(id) === String(postId));

  if (isBookmarked) {
    req.user.bookmarks = req.user.bookmarks.filter((id) => String(id) !== String(postId));
  } else {
    req.user.bookmarks.push(postId);
  }
  await req.user.save();

  res.status(200).json({ success: true, isBookmarked: !isBookmarked });
});

// @desc    Search posts by caption/hashtag
// @route   GET /api/posts/search?q=
// @access  Public
const searchPosts = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length === 0) {
    return res.status(200).json({ success: true, posts: [] });
  }

  const cleaned = q.replace(/^#/, '');

  const posts = await Post.find({
    isDeleted: false,
    $or: [
      { caption: { $regex: cleaned, $options: 'i' } },
      { hashtags: cleaned.toLowerCase() },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate('author', 'name username profilePicture');

  res.status(200).json({ success: true, posts });
});

// @desc    Trending posts (most likes+comments in the last 7 days)
// @route   GET /api/posts/trending
// @access  Public
const getTrendingPosts = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const posts = await Post.aggregate([
    { $match: { isDeleted: false, createdAt: { $gte: sevenDaysAgo } } },
    {
      $addFields: {
        engagementScore: { $add: [{ $size: '$likes' }, { $multiply: [{ $size: '$comments' }, 2] }] },
      },
    },
    { $sort: { engagementScore: -1 } },
    { $limit: 20 },
  ]);

  await Post.populate(posts, { path: 'author', select: 'name username profilePicture' });

  res.status(200).json({ success: true, posts });
});

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  sharePost,
  toggleBookmark,
  searchPosts,
  getTrendingPosts,
};
