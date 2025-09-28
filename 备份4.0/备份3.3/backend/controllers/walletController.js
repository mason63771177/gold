// const mysql = require('mysql2/promise');
// const Redis = require('ioredis');

class WalletController {
  constructor() {
    // 使用内存存储模拟数据库
    this.users = {
      'default': { 
        balance: 186.00, 
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
          id: 'TX_001',
          type: 'activate',
          amount: -100,
          balance: 86.00,
          createTime: Date.now() - 86400000,
          description: '激活缴费'
        },
        {
          id: 'TX_002',
          type: 'task',
          amount: 50,
          balance: 136.00,
          createTime: Date.now() - 43200000,
          description: '任务奖励'
        },
        {
          id: 'TX_003',
          type: 'redpacket',
          amount: 25.50,
          balance: 161.50,
          createTime: Date.now() - 21600000,
          description: '抢红包收入'
        },
        {
          id: 'TX_004',
          type: 'redpacket',
          amount: 24.50,
          balance: 186.00,
          createTime: Date.now() - 10800000,
          description: '抢红包收入'
        }
      ],
      'user1': [
        {
          id: 'TX_005',
          type: 'withdraw',
          amount: -200,
          balance: 650.25,
          createTime: Date.now() - 7200000,
          description: '提现申请'
        }
      ]
    };

    // 钱包配置
    this.config = {
      withdrawFeeRate: 4.8, // 提现费率 4.8%
      fixedFee: 2.0, // 固定手续费 2元
      dailyWithdrawLimit: 50000, // 日提现限额
      singleWithdrawLimit: {
        min: 20, // 单次最小提现
        max: 2000 // 单次最大提现
      }
    };
  }

  // 获取钱包信息（符合API规范）
  getWalletInfo = async (req, res) => {
    try {
      const userId = req.user?.id || 'default';
      const user = this.users[userId];
      
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
          timestamp: Date.now()
        });
      }

      res.json({
        code: 200,
        message: 'success',
        data: {
          balance: user.balance,
          withdrawFeeRate: this.config.withdrawFeeRate,
          fixedFee: this.config.fixedFee,
          dailyWithdrawLimit: this.config.dailyWithdrawLimit,
          singleWithdrawLimit: this.config.singleWithdrawLimit
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('获取钱包信息失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取钱包信息失败',
        timestamp: Date.now()
      });
    }
  }

  // 提现（符合API规范）
  withdraw = async (req, res) => {
    try {
      const userId = req.user?.id || 'default';
      const { amount, walletAddress } = req.body;
      
      if (!amount || !walletAddress) {
        return res.status(400).json({
          code: 400,
          message: '提现金额和钱包地址不能为空',
          timestamp: Date.now()
        });
      }

      const user = this.users[userId];
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
          timestamp: Date.now()
        });
      }

      // 验证提现金额
      if (amount < this.config.singleWithdrawLimit.min) {
        return res.status(400).json({
          code: 400,
          message: `单次提现金额不能少于${this.config.singleWithdrawLimit.min}元`,
          timestamp: Date.now()
        });
      }

      if (amount > this.config.singleWithdrawLimit.max) {
        return res.status(400).json({
          code: 400,
          message: `单次提现金额不能超过${this.config.singleWithdrawLimit.max}元`,
          timestamp: Date.now()
        });
      }

      // 计算手续费
      const feeByRate = amount * (this.config.withdrawFeeRate / 100);
      const totalFee = feeByRate + this.config.fixedFee;
      const actualAmount = amount - totalFee;

      // 检查余额
      if (user.balance < amount) {
        return res.status(400).json({
          code: 400,
          message: '余额不足',
          timestamp: Date.now()
        });
      }

      // 生成提现订单
      const orderId = `WITHDRAW_${Date.now()}`;
      
      // 扣除余额
      user.balance -= amount;
      
      // 记录交易
      if (!this.transactions[userId]) {
        this.transactions[userId] = [];
      }
      
      this.transactions[userId].push({
        id: `TX_${Date.now()}`,
        type: 'withdraw',
        amount: -amount,
        balance: user.balance,
        createTime: Date.now(),
        description: '提现申请'
      });

      res.json({
        code: 200,
        message: '提现申请成功',
        data: {
          orderId,
          amount,
          fee: parseFloat(totalFee.toFixed(2)),
          actualAmount: parseFloat(actualAmount.toFixed(2)),
          status: 'pending'
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('提现失败:', error);
      res.status(500).json({
        code: 500,
        message: '提现失败',
        timestamp: Date.now()
      });
    }
  }

  // 获取交易记录（符合API规范）
  getTransactions = async (req, res) => {
    try {
      const userId = req.user?.id || 'default';
      const { page = 1, limit = 10, type } = req.query;
      
      let transactions = this.transactions[userId] || [];
      
      // 按类型过滤
      if (type) {
        transactions = transactions.filter(tx => tx.type === type);
      }
      
      // 按时间倒序排序
      transactions.sort((a, b) => b.createTime - a.createTime);
      
      // 分页
      const total = transactions.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedTransactions = transactions.slice(startIndex, endIndex);

      res.json({
        code: 200,
        message: 'success',
        data: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          transactions: paginatedTransactions
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('获取交易记录失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取交易记录失败',
        timestamp: Date.now()
      });
    }
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