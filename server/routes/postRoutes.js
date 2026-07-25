const express = require('express');
const {
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
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/auth');
const { validate, postRules, commentRules } = require('../middleware/validators');
const upload = require('../middleware/upload');

const router = express.Router();

// Static routes before dynamic /:id routes
router.get('/search', searchPosts);
router.get('/trending', getTrendingPosts);

router.get('/', optionalAuth, getPosts);
router.post('/', protect, upload.single('image'), postRules, validate, createPost);

router.get('/:id', getPostById);
router.put('/:id', protect, postRules, validate, updatePost);
router.delete('/:id', protect, deletePost);

router.post('/:id/like', protect, likePost);
router.post('/:id/unlike', protect, unlikePost);
router.post('/:id/comment', protect, commentRules, validate, addComment);
router.delete('/:postId/comment/:commentId', protect, deleteComment);
router.post('/:id/share', protect, sharePost);
router.post('/:id/bookmark', protect, toggleBookmark);

module.exports = router;
