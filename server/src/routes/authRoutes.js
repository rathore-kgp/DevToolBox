const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiters');


router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;

