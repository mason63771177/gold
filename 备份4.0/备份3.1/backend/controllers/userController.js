const User = require('../models/User');
const { validationResult } = require('express-validator');

class UserController {
  // 获取用户详细信息
  static async getUserInfo(req, res) {
    try {
      const userId = req.user.id; // 修改为使用id而不是userId
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        message: '获取用户信息成功',
        data: {
          user: user.toSafeObject()
        }
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 更新用户状态
  static async updateUserStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '参数验证失败',
          errors: errors.array()
        });
      }

      const userId = req.user.id; // 修改为使用id而不是userId
      const { status, countdownEndTime } = req.body;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 验证状态切换的合法性
      const isValidTransition = UserController.validateStatusTransition(user.status, status);
      if (!isValidTransition) {
        return res.status(400).json({
          success: false,
          message: '无效的状态切换'
        });
      }

      // 更新用户状态
      await user.updateStatus(status, countdownEndTime);

      res.json({
        success: true,
        message: '状态更新成功',
        data: {
          status: status,
          countdownEndTime: countdownEndTime
        }
      });
    } catch (error) {
      console.error('更新用户状态失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 获取用户状态详情
  static async getUserStatus(req, res) {
    try {
      const userId = req.user.id; // 修改为使用id而不是userId
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 计算剩余时间
      let remainingHours = 0;
      if (user.countdown_end_time) {
        const now = new Date();
        const endTime = new Date(user.countdown_end_time);
        const diffMs = endTime.getTime() - now.getTime();
        remainingHours = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));
      }

      // 判断各种权限
      const canActivate = user.status === 1; // 只有新手未入金状态可以激活
      const canGrabRedPacket = user.status === 2 || user.status === 4; // 已入金168小时倒计时 或 大神状态
      const canReactivate = user.status === 3; // 挑战失败状态可以再次激活

      res.json({
        success: true,
        message: '获取状态成功',
        data: {
          status: user.status,
          statusName: user.getStatusName(),
          countdownEndTime: user.countdown_end_time,
          remainingHours: remainingHours,
          canActivate: canActivate,
          canGrabRedPacket: canGrabRedPacket,
          canReactivate: canReactivate,
          activationCount: user.activation_count,
          lastActivationTime: user.last_activation_time,
          balance: parseFloat(user.balance),
          frozenBalance: parseFloat(user.frozen_balance),
          totalEarnings: parseFloat(user.total_earnings),
          teamCount: user.team_count
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

  // 验证状态切换的合法性
  static validateStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      1: [2], // 新手未入金 -> 已入金168小时倒计时
      2: [3, 4], // 已入金168小时倒计时 -> 挑战失败 或 大神状态
      3: [2], // 挑战失败 -> 已入金168小时倒计时（再次激活）
      4: [3] // 大神状态 -> 挑战失败（理论上不应该发生，但保留）
    };

    return validTransitions[currentStatus] && validTransitions[currentStatus].includes(newStatus);
  }

  // 获取用户团队信息
  static async getUserTeam(req, res) {
    try {
      const userId = req.user.id; // 修改为使用id而不是userId
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 获取团队成员列表
      const teamMembers = await User.getTeamMembers(userId);
      
      // 计算团队统计
      const teamStats = {
        totalMembers: teamMembers.length,
        activeMembers: teamMembers.filter(member => member.status === 2 || member.status === 4).length,
        totalEarnings: teamMembers.reduce((sum, member) => sum + parseFloat(member.total_earnings), 0)
      };

      res.json({
        success: true,
        message: '获取团队信息成功',
        data: {
          inviteCode: user.invite_code,
          teamStats: teamStats,
          teamMembers: teamMembers.map(member => ({
            id: member.id,
            email: member.email.replace(/(.{2}).*(@.*)/, '$1***$2'), // 脱敏处理
            status: member.status,
            statusName: member.getStatusName(),
            totalEarnings: parseFloat(member.total_earnings),
            createdAt: member.created_at
          }))
        }
      });
    } catch (error) {
      console.error('获取团队信息失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 获取用户钱包信息
  static async getUserWallet(req, res) {
    try {
      const userId = req.user.id; // 修改为使用id而不是userId
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        message: '获取钱包信息成功',
        data: {
          balance: parseFloat(user.balance),
          frozenBalance: parseFloat(user.frozen_balance),
          totalEarnings: parseFloat(user.total_earnings),
          availableBalance: parseFloat(user.balance) - parseFloat(user.frozen_balance)
        }
      });
    } catch (error) {
      console.error('获取钱包信息失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }
}

module.exports = UserController;