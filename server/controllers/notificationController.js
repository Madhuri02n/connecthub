const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get logged-in user's notifications (paginated)
// @route   GET /api/notifications?page=1&limit=20
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ receiver: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name username profilePicture')
      .populate('post', 'image'),
    Notification.countDocuments({ receiver: req.user._id }),
    Notification.countDocuments({ receiver: req.user._id, read: false }),
  ]);

  res.status(200).json({
    success: true,
    notifications,
    unreadCount,
    pagination: { page, limit, total, hasMore: skip + notifications.length < total },
  });
});

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, receiver: req.user._id },
    { read: true }
  );
  res.status(200).json({ success: true });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ receiver: req.user._id, read: false }, { read: true });
  res.status(200).json({ success: true });
});

module.exports = { getNotifications, markAsRead, markAllAsRead };
