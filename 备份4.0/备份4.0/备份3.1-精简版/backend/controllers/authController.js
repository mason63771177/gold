const User = require('../models/User');
const { generateToken, blacklistToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

class AuthController {
  // 用户注册
  static async register(req, res) {
    try {
      // 验证输入
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '输入验证失败',
          errors: errors.array()
        });
      }

      const { email, password, inviterCode } = req.body;

      // 检查邮箱是否已注册
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '该邮箱已注册'
        });
      }

      // 验证邀请码
      if (!inviterCode) {
        return res.status(400).json({
          success: false,
          message: '邀请码为必填项'
        });
      }

      const inviter = await User.findByInviteCode(inviterCode);
      if (!inviter) {
        return res.status(400).json({
          success: false,
          message: '邀请码无效'
        });
      }

      // 创建用户
      const user = await User.create({
        email,
        password,
        inviterCode
      });

      // 生成token
      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        message: '注册成功',
        data: {
          user: user.toSafeObject(),
          token
        }
      });

    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '注册失败'
      });
    }
  }

  // 用户登录
  static async login(req, res) {
    try {
      // 验证输入
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '输入验证失败',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // 查找用户
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '邮箱或密码错误'
        });
      }

      // 验证密码
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: '邮箱或密码错误'
        });
      }

      // 检查用户状态，如果倒计时结束且状态为2，自动转为状态3
      if (user.status === 2 && user.isCountdownExpired()) {
        await user.updateStatus(3);
      }

      // 生成token
      const token = generateToken(user.id);

      res.json({
        success: true,
        message: '登录成功',
        data: {
          user: user.toSafeObject(),
          token
        }
      });

    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({
        success: false,
        message: '登录失败'
      });
    }
  }

  // 用户登出
  static async logout(req, res) {
    try {
      // 将当前token加入黑名单
      if (req.token) {
        await blacklistToken(req.token);
      }

      res.json({
        success: true,
        message: '登出成功'
      });

    } catch (error) {
      console.error('登出错误:', error);
      res.status(500).json({
        success: false,
        message: '登出失败'
      });
    }
  }

  // 获取当前用户信息
  static async getProfile(req, res) {
    try {
      const user = req.user;

      // 检查用户状态，如果倒计时结束且状态为2，自动转为状态3
      if (user.status === 2 && user.isCountdownExpired()) {
        await user.updateStatus(3);
      }

      // 获取团队信息
      const teamInfo = await user.getTeamInfo();

      res.json({
        success: true,
        data: {
          user: user.toSafeObject(),
          teamInfo
        }
      });

    } catch (error) {
      console.error('获取用户信息错误:', error);
      res.status(500).json({
        success: false,
        message: '获取用户信息失败'
      });
    }
  }

  // 验证邀请码
  static async validateInviteCode(req, res) {
    try {
      const { inviteCode } = req.params;

      const inviter = await User.findByInviteCode(inviteCode);
      if (!inviter) {
        return res.status(404).json({
          success: false,
          message: '邀请码无效'
        });
      }

      res.json({
        success: true,
        message: '邀请码有效',
        data: {
          inviterEmail: inviter.email.replace(/(.{2}).*(@.*)/, '$1***$2'), // 隐藏部分邮箱
          inviterTeamCount: inviter.team_count
        }
      });

    } catch (error) {
      console.error('验证邀请码错误:', error);
      res.status(500).json({
        success: false,
        message: '验证邀请码失败'
      });
    }
  }

  // 刷新token
  static async refreshToken(req, res) {
    try {
      const user = req.user;
      
      // 将旧token加入黑名单
      if (req.token) {
        await blacklistToken(req.token);
      }

      // 生成新token
      const newToken = generateToken(user.id);

      res.json({
        success: true,
        message: 'Token刷新成功',
        data: {
          token: newToken
        }
      });

    } catch (error) {
      console.error('刷新token错误:', error);
      res.status(500).json({
        success: false,
        message: '刷新token失败'
      });
    }
  }
}

// 输入验证规则
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码至少需要6位字符'),
  body('inviterCode')
    .notEmpty()
    .withMessage('邀请码不能为空')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
];

module.exports = {
  AuthController,
  registerValidation,
  loginValidation
};