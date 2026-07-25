const express = require('express');
const {
  getMyProfile,
  getUserByUsername,
  updateProfile,
  updateProfilePicture,
  followUser,
  unfollowUser,
  searchUsers,
  getSuggestedUsers,
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');
const { validate, profileUpdateRules } = require('../middleware/validators');
const upload = require('../middleware/upload');

const router = express.Router();

// IMPORTANT: specific/static routes must come before the dynamic /:username route
router.get('/profile', protect, getMyProfile);
router.put('/profile', protect, profileUpdateRules, validate, updateProfile);
router.put('/profile/picture', protect, upload.single('image'), updateProfilePicture);

router.get('/search', searchUsers);
router.get('/suggestions', protect, getSuggestedUsers);

router.post('/follow/:id', protect, followUser);
router.post('/unfollow/:id', protect, unfollowUser);

router.get('/:username', optionalAuth, getUserByUsername);

module.exports = router;
