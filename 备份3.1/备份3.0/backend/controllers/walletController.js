// const mysql = require('mysql2/promise');
// const Redis = require('ioredis');

class WalletController {
  constructor() {
    // 使用内存存储模拟数据库
    this.users = {
      'default': { 
        balance: 1250.50, 
        wallet_address: null 
      },
      'user1': { 
        balance: 850.25, 
        wallet_address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE' 
      }
    };

    this.transactions = {
      'default': [
        {
          id: 1,
          type: 'activation',
          amount: -100,
          fee: 0,
          actual_amount: 100,
          wallet_address: null,
          status: 'completed',
          description: '激活缴费',
          created_at: new Date('2024-01-15T10:30:00')
        },
        {
          id: 2,
          type: 'task_reward',
          amount: 50,
          fee: 0,
          actual_amount: 50,
          wallet_address: null,
          status: 'completed',
          description: '任务奖励',
          created_at: new Date('2024-01-15T14:20:00')
        },
        {
          id: 3,
          type: 'redpacket',
          amount: 25.50,
          fee: 0,
          actual_amount: 25.50,
          wallet_address: null,
          status: 'completed',
          description: '红包收入',
          created_at: new Date('2024-01-16T09:15:00')
        }
      ],
      'user1': [
        {
          id: 4,
          type: 'withdraw',
          amount: -200,
          fee: 10,
          actual_amount: 190,
          wallet_address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
          status: 'processing',
          description: '提现申请',
          created_at: new Date('2024-01-16T16:45:00')
        }
      ]
    };

    // Redis连接 - 暂时注释掉
    // this.redis = new Redis({
    //   host: process.env.REDIS_HOST || 'localhost',
    //   port: process.env.REDIS_PORT || 6379,
    //   password: process.env.REDIS_PASSWORD || '',
    //   retryDelayOnFailover: 100,
    //   maxRetriesPerRequest: 3
    // });
  }

  // 获取钱包余额
  async getBalance(req, res) {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '用户ID不能为空'
        });
      }

      // 从内存存储获取用户余额
      const user = this.users[userId];
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }
      
      res.json({
        success: true,
        data: {
          balance: parseFloat(user.balance) || 0,
          walletAddress: user.wallet_address || null
        }
      });

    } catch (error) {
      console.error('获取钱包余额失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 绑定钱包地址
  async bindAddress(req, res) {
    try {
      const { userId, walletAddress } = req.body;
      
      if (!userId || !walletAddress) {
        return res.status(400).json({
          success: false,
          message: '用户ID和钱包地址不能为空'
        });
      }

      // 验证USDT TRC20地址格式
      if (!walletAddress.startsWith('T') || walletAddress.length !== 34) {
        return res.status(400).json({
          success: false,
          message: '请输入有效的USDT TRC20钱包地址'
        });
      }

      // 检查用户是否存在
      if (!this.users[userId]) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 更新用户钱包地址
      this.users[userId].wallet_address = walletAddress;

      res.json({
        success: true,
        message: '钱包地址绑定成功'
      });

    } catch (error) {
      console.error('绑定钱包地址失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 提现申请
  async withdraw(req, res) {
    try {
      const { userId, amount, walletAddress } = req.body;
      
      if (!userId || !amount || !walletAddress) {
        return res.status(400).json({
          success: false,
          message: '参数不完整'
        });
      }

      const withdrawAmount = parseFloat(amount);
      if (isNaN(withdrawAmount) || withdrawAmount < 20) {
        return res.status(400).json({
          success: false,
          message: '提现金额不能少于20 USDT'
        });
      }

      // 检查用户是否存在
      if (!this.users[userId]) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const currentBalance = parseFloat(this.users[userId].balance) || 0;
      
      // 计算手续费：固定费用2 USDT + 5%比例费用
      const feeRate = 0.05;
      const fixedFee = 2;
      const percentFee = withdrawAmount * feeRate;
      const totalFee = fixedFee + percentFee;
      const totalDeduct = withdrawAmount + totalFee;

      if (totalDeduct > currentBalance) {
        return res.status(400).json({
          success: false,
          message: '余额不足',
          data: {
            withdrawAmount: withdrawAmount,
            totalFee: totalFee,
            totalDeduct: totalDeduct,
            currentBalance: currentBalance
          }
        });
      }

      // 扣除用户余额
      this.users[userId].balance = currentBalance - totalDeduct;

      // 创建提现记录
      const withdrawId = Date.now();
      const newTransaction = {
        id: withdrawId,
        type: 'withdraw',
        amount: -totalDeduct,
        fee: totalFee,
        actual_amount: withdrawAmount,
        wallet_address: walletAddress,
        status: 'processing',
        description: `提现${withdrawAmount.toFixed(2)} USDT (含手续费${totalFee.toFixed(2)})`,
        created_at: new Date()
      };

      if (!this.transactions[userId]) {
        this.transactions[userId] = [];
      }
      this.transactions[userId].unshift(newTransaction);

      res.json({
        success: true,
        message: '提现申请已提交',
        data: {
          withdrawId: withdrawId,
          withdrawAmount: withdrawAmount,
          totalFee: totalFee,
          actualAmount: withdrawAmount,
          remainingBalance: currentBalance - totalDeduct
        }
      });

    } catch (error) {
      console.error('提现申请失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 获取交易记录
  async getTransactions(req, res) {
    try {
      const { userId, page = 1, limit = 20 } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '用户ID不能为空'
        });
      }

      // 检查用户是否存在
      if (!this.users[userId]) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const userTransactions = this.transactions[userId] || [];
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const paginatedTransactions = userTransactions.slice(offset, offset + parseInt(limit));

      const transactions = paginatedTransactions.map(row => ({
        id: row.id,
        type: row.type,
        amount: parseFloat(row.amount),
        fee: parseFloat(row.fee) || 0,
        actualAmount: parseFloat(row.actual_amount) || Math.abs(parseFloat(row.amount)),
        walletAddress: row.wallet_address,
        status: row.status,
        statusText: this.getStatusText(row.status),
        description: row.description,
        timestamp: row.created_at
      }));

      res.json({
        success: true,
        data: {
          transactions: transactions,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: userTransactions.length,
            totalPages: Math.ceil(userTransactions.length / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('获取交易记录失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 更新用户余额（内部方法，用于任务奖励、红包等）
  async updateBalance(userId, amount, type, description) {
    try {
      // 检查用户是否存在
      if (!this.users[userId]) {
        this.users[userId] = { balance: 0, wallet_address: null };
        this.transactions[userId] = [];
      }

      // 更新用户余额
      this.users[userId].balance = (parseFloat(this.users[userId].balance) || 0) + parseFloat(amount);

      // 记录交易
      const newTransaction = {
        id: Date.now() + Math.random(),
        type: type,
        amount: parseFloat(amount),
        fee: 0,
        actual_amount: Math.abs(parseFloat(amount)),
        wallet_address: null,
        status: 'completed',
        description: description,
        created_at: new Date()
      };

      if (!this.transactions[userId]) {
        this.transactions[userId] = [];
      }
      this.transactions[userId].unshift(newTransaction);

      return true;

    } catch (error) {
      console.error('更新用户余额失败:', error);
      return false;
    }
  }

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      'processing': '处理中',
      'confirming': '确认中',
      'completed': '已完成',
      'failed': '失败',
      'cancelled': '已取消'
    };
    return statusMap[status] || '未知状态';
  }
}

module.exports = WalletController;