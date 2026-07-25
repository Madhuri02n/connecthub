const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get logged-in user's own profile (with post count)
// @route   GET /api/users/profile
// @access  Private
const getMyProfile = asyncHandler(async (req, res) => {
  const postsCount = await Post.countDocuments({ author: req.user._id, isDeleted: false });
  res.status(200).json({ success: true, user: req.user, postsCount });
});

// @desc    Get any user's public profile by username
// @route   GET /api/users/:username
// @access  Public (optionalAuth to show isFollowing)
const getUserByUsername = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!user) throw new ApiError('User not found', 404);

  const postsCount = await Post.countDocuments({ author: user._id, isDeleted: false });
  const isFollowing = req.user ? user.followers.some((f) => f.equals(req.user._id)) : false;

  res.status(200).json({ success: true, user, postsCount, isFollowing });
});

// @desc    Update logged-in user's profile (name, bio, username)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, username } = req.body;

  if (username && username !== req.user.username) {
    const taken = await User.findOne({ username });
    if (taken) throw new ApiError('Username is already taken', 409);
  }

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (bio !== undefined) updates.bio = bio;
  if (username !== undefined) updates.username = username;

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, user });
});

// @desc    Upload/replace profile picture
// @route   PUT /api/users/profile/picture
// @access  Private
const updateProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError('No image file provided', 400);

  const oldPublicId = req.user.profilePicture?.publicId;

  const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer, 'connecthub/avatars');

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profilePicture: { url, publicId } },
    { new: true }
  );

  if (oldPublicId) await deleteFromCloudinary(oldPublicId);

  res.status(200).json({ success: true, user });
});

// @desc    Follow a user
// @route   POST /api/users/follow/:id
// @access  Private
const followUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;

  if (targetId === String(req.user._id)) {
    throw new ApiError('You cannot follow yourself', 400);
  }

  const targetUser = await User.findById(targetId);
  if (!targetUser) throw new ApiError('User not found', 404);

  const alreadyFollowing = targetUser.followers.some((f) => f.equals(req.user._id));
  if (alreadyFollowing) throw new ApiError('You already follow this user', 409);

  targetUser.followers.push(req.user._id);
  req.user.following.push(targetUser._id);

  await targetUser.save();
  await req.user.save();

  await Notification.create({
    sender: req.user._id,
    receiver: targetUser._id,
    type: 'follow',
  });

  // Emit real-time notification if Socket.IO is attached to the app
  const io = req.app.get('io');
  if (io) io.to(String(targetUser._id)).emit('notification', { type: 'follow', from: req.user.username });

  res.status(200).json({ success: true, message: `You are now following ${targetUser.username}` });
});

// @desc    Unfollow a user
// @route   POST /api/users/unfollow/:id
// @access  Private
const unfollowUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const targetUser = await User.findById(targetId);
  if (!targetUser) throw new ApiError('User not found', 404);

  targetUser.followers = targetUser.followers.filter((f) => !f.equals(req.user._id));
  req.user.following = req.user.following.filter((f) => !f.equals(targetUser._id));

  await targetUser.save();
  await req.user.save();

  res.status(200).json({ success: true, message: `You unfollowed ${targetUser.username}` });
});

// @desc    Search users by name/username
// @route   GET /api/users/search?q=
// @access  Public
const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length === 0) {
    return res.status(200).json({ success: true, users: [] });
  }

  const users = await User.find({
    $or: [
      { username: { $regex: q, $options: 'i' } },
      { name: { $regex: q, $options: 'i' } },
    ],
  })
    .select('name username profilePicture bio')
    .limit(20);

  res.status(200).json({ success: true, users });
});

// @desc    Suggested users to follow (not already followed, excluding self)
// @route   GET /api/users/suggestions
// @access  Private
const getSuggestedUsers = asyncHandler(async (req, res) => {
  const excludeIds = [req.user._id, ...req.user.following];

  const suggestions = await User.find({ _id: { $nin: excludeIds } })
    .select('name username profilePicture bio')
    .limit(10);

  res.status(200).json({ success: true, users: suggestions });
});

module.exports = {
  getMyProfile,
  getUserByUsername,
  updateProfile,
  updateProfilePicture,
  followUser,
  unfollowUser,
  searchUsers,
  getSuggestedUsers,
};
