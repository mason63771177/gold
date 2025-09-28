const express = require('express');
const router = express.Router();
const WalletController = require('../controllers/walletController');
const rateLimit = require('express-rate-limit');

// 创建控制器实例
const walletController = new WalletController();

// 限流配置
const walletLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 每个IP最多1000次请求（增加限制）
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  }
});

const withdrawLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 50, // 每个IP最多50次提现请求（增加限制）
  message: {
    success: false,
    message: '提现请求过于频繁，请稍后再试'
  }
});

// 认证中间件（简单版本，实际项目中应该使用JWT等）
const authMiddleware = (req, res, next) => {
  // 这里可以添加认证逻辑
  // 目前为了测试，直接通过
  next();
};

// 获取钱包余额和地址
router.get('/balance', walletLimiter, authMiddleware, (req, res) => {
  walletController.getBalance(req, res);
});

// 绑定钱包地址
router.post('/bind-address', walletLimiter, authMiddleware, (req, res) => {
  walletController.bindAddress(req, res);
});

// 提现申请
router.post('/withdraw', withdrawLimiter, authMiddleware, (req, res) => {
  walletController.withdraw(req, res);
});

// 获取交易记录
router.get('/transactions', walletLimiter, authMiddleware, (req, res) => {
  walletController.getTransactions(req, res);
});

module.exports = router;