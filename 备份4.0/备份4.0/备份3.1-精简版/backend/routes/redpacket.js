const express = require('express');
const router = express.Router();
const RedpacketController = require('../controllers/redpacketController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// 抢红包限流（严格限制）
const grabLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 5, // 每分钟最多5次抢红包尝试
  message: {
    success: false,
    message: '抢红包操作过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 查询限流
const queryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 30, // 每分钟最多30次查询
  message: {
    success: false,
    message: '查询过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * @route GET /api/redpacket/status
 * @desc 获取抢红包状态
 * @access Public (临时测试)
 */
router.get('/status', queryLimiter, RedpacketController.getRedpacketStatus);

/**
 * @route POST /api/redpacket/grab
 * @desc 抢红包
 * @access Public (临时测试)
 */
router.post('/grab', grabLimiter, RedpacketController.grabRedpacket);

/**
 * @route GET /api/redpacket/records
 * @desc 获取红包记录
 * @access Public (临时测试)
 */
router.get('/records', queryLimiter, RedpacketController.getRecords);

/**
 * @route POST /api/redpacket/reset
 * @desc 重置红包记录（测试用）
 * @access Public (临时测试)
 */
router.post('/reset', RedpacketController.resetRecords);

module.exports = router;