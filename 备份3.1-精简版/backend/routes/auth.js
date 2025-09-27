const express = require('express');
const router = express.Router();
const { AuthController, registerValidation, loginValidation } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// 登录注册限流
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 最多5次尝试
  message: {
    success: false,
    message: '请求过于频繁，请15分钟后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 验证邀请码限流
const validateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 10, // 最多10次
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  }
});

/**
 * @route POST /api/auth/register
 * @desc 用户注册
 * @access Public
 */
router.post('/register', authLimiter, registerValidation, AuthController.register);

/**
 * @route POST /api/auth/login
 * @desc 用户登录
 * @access Public
 */
router.post('/login', authLimiter, loginValidation, AuthController.login);

/**
 * @route POST /api/auth/logout
 * @desc 用户登出
 * @access Private
 */
router.post('/logout', authenticateToken, AuthController.logout);

/**
 * @route GET /api/auth/profile
 * @desc 获取当前用户信息
 * @access Private
 */
router.get('/profile', authenticateToken, AuthController.getProfile);

/**
 * @route GET /api/auth/validate-invite/:inviteCode
 * @desc 验证邀请码
 * @access Public
 */
router.get('/validate-invite/:inviteCode', validateLimiter, AuthController.validateInviteCode);

/**
 * @route POST /api/auth/refresh-token
 * @desc 刷新访问令牌
 * @access Private
 */
router.post('/refresh-token', authenticateToken, AuthController.refreshToken);

module.exports = router;