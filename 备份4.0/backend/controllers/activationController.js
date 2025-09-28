const User = require('../models/User');
const Transaction = require('../models/Transaction');
const PendingTransaction = require('../models/PendingTransaction');
const trc20Service = require('../services/TRC20Service');
const EmptyStructureService = require('../services/EmptyStructureService');
const { v4: uuidv4 } = require('uuid');

class ActivationController {
  // 获取用户状态
  static async getUserStatus(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }

      // 计算倒计时
      let countdown = null;
      if (user.status === 2 && user.activation_time) {
        const activationTime = new Date(user.activation_time);
        const endTime = new Date(activationTime.getTime() + 168 * 60 * 60 * 1000); // 168小时后
        const now = new Date();
        
        if (now < endTime) {
          countdown = Math.max(0, Math.floor((endTime - now) / 1000)); // 剩余秒数
        }
      }

      // 判断是否可以抢红包（仅状态2可以抢红包）
      const canGrabRedPacket = user.status === 2;

      res.json({
        success: true,
        data: {
          status: user.status,
          countdown: countdown,
          canGrabRedPacket: canGrabRedPacket,
          activationTime: user.activation_time,
          totalEarnings: user.total_earnings || 0
        }
      });
    } catch (error) {
      console.error('获取用户状态失败:', error);
      res.status(500).json({ error: '获取用户状态失败' });
    }
  }

  // 激活账号
  static async activateAccount(req, res) {
    try {
      const userId = req.user.id;
      
      // 获取用户信息
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 检查用户状态
      if (user.status !== 1 && user.status !== 3) {
        return res.status(400).json({
          success: false,
          message: '当前状态不允许激活'
        });
      }

      // 检查是否已有待确认的激活交易
      const existingTransactions = await PendingTransaction.findPending();
      const existingTransaction = existingTransactions.find(t => 
        t.userId === userId && t.type === 'activation' && !t.isExpired()
      );
      if (existingTransaction && !existingTransaction.isExpired()) {
        return res.json({
          success: true,
          data: {
            orderId: existingTransaction.orderId,
            walletAddress: existingTransaction.walletAddress,
            amount: existingTransaction.amount,
            expiresAt: existingTransaction.expiresAt,
            qrCode: `tron:${existingTransaction.walletAddress}?amount=${existingTransaction.amount}&token=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`
          }
        });
      }

      // 分配钱包地址
      const walletAddress = await trc20Service.assignWalletAddress(userId, 'activation');
      
      // 生成激活订单
      const orderId = `ACT_${Date.now()}_${userId}`;
      const activationAmount = 100; // 激活金额100 USDT
      
      // 创建待确认交易
      const pendingTransaction = await PendingTransaction.create({
        userId,
        orderId,
        walletAddress: walletAddress.address,
        amount: activationAmount,
        type: 'activation'
      });

      res.json({
        success: true,
        data: {
          orderId,
          walletAddress: walletAddress.address,
          amount: activationAmount,
          expiresAt: pendingTransaction.expiresAt,
          qrCode: `tron:${walletAddress.address}?amount=${activationAmount}&token=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` // USDT合约地址
        }
      });

    } catch (error) {
      console.error('激活账号失败:', error);
      res.status(500).json({
        success: false,
        message: '激活失败，请稍后重试'
      });
    }
  }

  // 确认激活（模拟链上确认）
  static async confirmActivation(req, res) {
    try {
      const { orderId, txHash } = req.body;
      
      if (!orderId || !txHash) {
        return res.status(400).json({
          success: false,
          message: '订单ID和交易哈希不能为空'
        });
      }

      // 查找激活交易记录
      const transaction = await Transaction.findByOrderId(orderId);
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: '激活订单不存在'
        });
      }

      if (transaction.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: '订单状态异常'
        });
      }

      const user = await User.findById(transaction.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 更新交易状态
      await transaction.updateStatus('completed', txHash);

      // 设置168小时倒计时
      const countdownEndTime = new Date(Date.now() + 168 * 60 * 60 * 1000);
      
      // 更新用户状态为已激活
      await user.updateStatus(2, countdownEndTime);

      // 处理多层级奖励分配和空结构资金
      try {
        const emptyStructureResult = await EmptyStructureService.processEmptyStructure(user.id);
        console.log('空结构处理结果:', emptyStructureResult.summary);
      } catch (error) {
        console.error('处理空结构失败:', error);
        // 空结构处理失败不影响激活成功，但需要记录错误
      }

      res.json({
        success: true,
        message: '激活成功',
        data: {
          status: 2,
          countdownEndTime: countdownEndTime,
          message: $t('messages._______168________')
        }
      });
    } catch (error) {
      console.error('确认激活失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 处理邀请人奖励
  static async processInviterReward(inviterId, newUserId, rewardAmount) {
    try {
      const inviter = await User.findById(inviterId);
      if (!inviter) return;

      // 给邀请人增加余额
      await inviter.updateBalance(rewardAmount, 'add');

      // 记录奖励交易
      await Transaction.create({
        userId: inviterId,
        type: 'referral_reward',
        amount: rewardAmount,
        status: 'completed',
        description: `邀请奖励 - 用户${newUserId}激活`,
        relatedUserId: newUserId
      });

      // TODO: 发送推送通知给邀请人
      console.log(`用户${inviterId}获得邀请奖励${rewardAmount} USDT`);
    } catch (error) {
      console.error('处理邀请人奖励失败:', error);
    }
  }

  // 获取激活历史
  static async getActivationHistory(req, res) {
    try {
      const userId = req.user.id;
      
      const activations = await Transaction.findByUserIdAndType(userId, 'activation', 50);
      
      res.json({
        success: true,
        message: '获取激活历史成功',
        data: {
          activations: activations.map(activation => ({
            orderId: activation.orderId,
            amount: Math.abs(activation.amount),
            status: activation.status,
            description: activation.description,
            walletAddress: activation.walletAddress,
            txHash: activation.txHash,
            createdAt: activation.createdAt,
            confirmedAt: activation.updatedAt
          }))
        }
      });
    } catch (error) {
      console.error('获取激活历史失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }
}

module.exports = ActivationController;