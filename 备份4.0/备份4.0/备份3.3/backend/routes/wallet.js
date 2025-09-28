const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const WalletController = require('../controllers/walletController');

// 创建控制器实例
const walletController = new WalletController();

// 提现限流：每分钟最多3次
const withdrawLimit = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 3,
  message: { success: false, message: '提现操作过于频繁，请稍后再试' }
});

// API规范接口
router.get('/info', walletController.getWalletInfo);
router.post('/withdraw', withdrawLimit, walletController.withdraw);
router.get('/transactions', walletController.getTransactions);

// 兼容性接口
router.get('/balance', walletController.getBalance);
router.post('/bind-address', walletController.bindAddress);
router.post('/withdraw-legacy', withdrawLimit, walletController.withdraw);
router.get('/transactions-legacy', walletController.getTransactions);

module.exports = router;