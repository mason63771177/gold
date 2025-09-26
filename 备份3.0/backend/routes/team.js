const express = require('express');
const rateLimit = require('express-rate-limit');
const TeamController = require('../controllers/teamController');

const router = express.Router();
const teamController = new TeamController();

// 限流配置
const teamLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 每个IP最多1000次请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  }
});

const inviteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 100, // 每个IP最多100次邀请请求
  message: {
    success: false,
    message: '邀请请求过于频繁，请稍后再试'
  }
});

// 简单的认证中间件（模拟）
const authMiddleware = (req, res, next) => {
  // 在实际应用中，这里应该验证JWT token或session
  // 现在只是简单检查是否有userId参数
  const userId = req.query.userId || req.body.userId;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: '未授权访问'
    });
  }
  next();
};

// 团队信息相关路由
router.get('/info', teamLimiter, authMiddleware, (req, res) => {
  teamController.getTeamInfo(req, res);
});

// 团队成员列表
router.get('/members', teamLimiter, authMiddleware, (req, res) => {
  teamController.getTeamMembers(req, res);
});

// 获取邀请链接
router.get('/invite-link', teamLimiter, authMiddleware, (req, res) => {
  teamController.getInviteLink(req, res);
});

// 处理邀请注册
router.post('/invite', inviteLimiter, (req, res) => {
  teamController.processInvite(req, res);
});

// 团队统计
router.get('/stats', teamLimiter, authMiddleware, (req, res) => {
  teamController.getTeamStats(req, res);
});

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '团队服务运行正常',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;