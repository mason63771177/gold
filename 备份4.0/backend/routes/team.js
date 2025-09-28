const express = require('express');
const rateLimit = require('express-rate-limit');
const TeamController = require('../controllers/teamController');

const router = express.Router();
const teamController = new TeamController();

// 限流配置
const teamLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 10, // 每分钟最多10次请求
  message: {
    code: 429,
    message: '请求过于频繁，请稍后再试',
    timestamp: Date.now()
  }
});

// API规范接口
router.get('/info', teamController.getTeamInfo);
router.post('/invite', teamLimiter, teamController.generateInviteLink);

module.exports = router;