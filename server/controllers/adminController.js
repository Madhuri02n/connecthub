const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const ApiError = require('../utils/ApiError');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    List all users (paginated)
// @route   GET /api/admin/users?page=1&limit=20
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    users,
    pagination: { page, limit, total, hasMore: skip + users.length < total },
  });
});

// @desc    Deactivate (ban) or reactivate a user account
// @route   PUT /api/admin/users/:id/toggle-active
// @access  Private/Admin
const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError('User not found', 404);

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? 'reactivated' : 'deactivated'}`,
    user,
  });
});

// @desc    Delete an inappropriate post (hard delete + Cloudinary cleanup)
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
const adminDeletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError('Post not found', 404);

  await deleteFromCloudinary(post.image.publicId);
  await Comment.deleteMany({ post: post._id });
  await Post.findByIdAndDelete(post._id);

  res.status(200).json({ success: true, message: 'Post permanently removed' });
});

// @desc    Dashboard statistics (users, posts, comments, growth)
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalUsers, totalPosts, totalComments, newUsersLast30Days, newPostsLast30Days, activeUsers] =
    await Promise.all([
      User.countDocuments(),
      Post.countDocuments({ isDeleted: false }),
      Comment.countDocuments(),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Post.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, isDeleted: false }),
      User.countDocuments({ isActive: true }),
    ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      activeUsers,
      totalPosts,
      totalComments,
      newUsersLast30Days,
      newPostsLast30Days,
    },
  });
});

module.exports = { getAllUsers, toggleUserActive, adminDeletePost, getDashboardStats };
