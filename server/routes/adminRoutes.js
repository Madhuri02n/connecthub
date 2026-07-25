const express = require('express');
const {
  getAllUsers,
  toggleUserActive,
  adminDeletePost,
  getDashboardStats,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect, adminOnly); // every admin route requires auth + admin role

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-active', toggleUserActive);
router.delete('/posts/:id', adminDeletePost);

module.exports = router;
