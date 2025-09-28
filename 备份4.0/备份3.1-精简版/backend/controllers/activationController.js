const User = require('../models/User');
const Transaction = require('../models/Transaction');
const PendingTransaction = require('../models/PendingTransaction');
const trc20Service = require('../services/TRC20Service');
const { v4: uuidv4 } = require('uuid');

class ActivationController {
  // 获取用户状态
  static async getUserStatus(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 检查倒计时是否结束
      let currentStatus = user.status;
      if (user.status === 2 && user.isCountdownExpired()) {
        // 倒计时结束，切换到状态3
        await user.updateStatus(3);
        currentStatus = 3;
      }

      const statusNames = {
        1: '新手未入金',
        2: '已入金168小时倒计时',
        3: '倒计时结束'
      };

      let remainingHours = 0;
      if (currentStatus === 2 && user.countdown_end_time) {
        const now = new Date();
        const endTime = new Date(user.countdown_end_time);
        remainingHours = Math.max(0, Math.ceil((endTime - now) / (1000 * 60 * 60)));
      }

      res.json({
        success: true,
        message: '获取状态成功',
        data: {
          status: currentStatus,
          statusName: statusNames[currentStatus],
          countdownEndTime: user.countdown_end_time,
          remainingHours,
          canActivate: user.canActivate(),
          canGrabRedPacket: currentStatus === 2 || currentStatus === 4,
          activationCount: user.activation_count,
          lastActivationTime: user.last_activation_time
        }
      });
    } catch (error) {
      console.error('获取用户状态失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
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

      // 如果有邀请人，给邀请人发放奖励
      if (user.inviter_id) {
        await ActivationController.processInviterReward(user.inviter_id, user.id, 10);
      }

      res.json({
        success: true,
        message: '激活成功',
        data: {
          status: 2,
          countdownEndTime: countdownEndTime,
          message: '账号激活成功！168小时挑战期已开始，请完成任务获得收益。'
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