// const mysql = require('mysql2/promise');
// const Redis = require('ioredis');

class TeamController {
  constructor() {
    // 内存存储模拟数据
    this.users = new Map([
      ['default', {
        id: 'default',
        username: '用户001',
        inviteCode: 'INV001',
        inviterId: null,
        level: 1,
        totalInvites: 5,
        directInvites: 2,
        teamSize: 15,
        teamLevels: 3,
        joinTime: '2024-01-15T10:30:00.000Z',
        status: 'active'
      }],
      ['user002', {
        id: 'user002',
        username: '用户002',
        inviteCode: 'INV002',
        inviterId: 'default',
        level: 2,
        totalInvites: 3,
        directInvites: 1,
        teamSize: 8,
        teamLevels: 2,
        joinTime: '2024-01-16T14:20:00.000Z',
        status: 'active'
      }],
      ['user003', {
        id: 'user003',
        username: '用户003',
        inviteCode: 'INV003',
        inviterId: 'default',
        level: 2,
        totalInvites: 2,
        directInvites: 2,
        teamSize: 5,
        teamLevels: 1,
        joinTime: '2024-01-17T09:15:00.000Z',
        status: 'active'
      }],
      ['user004', {
        id: 'user004',
        username: '用户004',
        inviteCode: 'INV004',
        inviterId: 'user002',
        level: 3,
        totalInvites: 1,
        directInvites: 1,
        teamSize: 3,
        teamLevels: 1,
        joinTime: '2024-01-18T16:45:00.000Z',
        status: 'active'
      }]
    ]);

    // 团队关系数据
    this.teamRelations = new Map([
      ['default', {
        children: ['user002', 'user003'],
        descendants: ['user002', 'user003', 'user004', 'user005', 'user006'],
        ancestors: []
      }],
      ['user002', {
        children: ['user004'],
        descendants: ['user004', 'user005'],
        ancestors: ['default']
      }],
      ['user003', {
        children: ['user006'],
        descendants: ['user006'],
        ancestors: ['default']
      }],
      ['user004', {
        children: ['user005'],
        descendants: ['user005'],
        ancestors: ['default', 'user002']
      }]
    ]);

    // 团队统计数据
    this.teamStats = new Map([
      ['default', {
        totalMembers: 15,
        activeMembers: 12,
        newMembersToday: 2,
        newMembersWeek: 8,
        levelDistribution: {
          level1: 1,
          level2: 2,
          level3: 4,
          level4: 3,
          level5: 2,
          level6: 2,
          level7: 1
        },
        teamPerformance: {
          totalTasks: 45,
          completedTasks: 38,
          totalRewards: 1250.5,
          teamBonus: 125.0
        }
      }]
    ]);
  }

  // 获取团队信息
  async getTeamInfo(req, res) {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '用户ID不能为空'
        });
      }

      const user = this.users.get(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const teamRelation = this.teamRelations.get(userId) || { children: [], descendants: [], ancestors: [] };
      const teamStat = this.teamStats.get(userId) || {
        totalMembers: 0,
        activeMembers: 0,
        newMembersToday: 0,
        newMembersWeek: 0,
        levelDistribution: {},
        teamPerformance: { totalTasks: 0, completedTasks: 0, totalRewards: 0, teamBonus: 0 }
      };

      const teamInfo = {
        userInfo: {
          id: user.id,
          username: user.username,
          inviteCode: user.inviteCode,
          level: user.level,
          joinTime: user.joinTime,
          status: user.status
        },
        teamStructure: {
          totalInvites: user.totalInvites,
          directInvites: user.directInvites,
          teamSize: user.teamSize,
          teamLevels: user.teamLevels,
          children: teamRelation.children,
          descendants: teamRelation.descendants,
          ancestors: teamRelation.ancestors
        },
        teamStats: teamStat
      };

      res.json({
        success: true,
        data: teamInfo
      });

    } catch (error) {
      console.error('获取团队信息失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 获取团队成员列表
  async getTeamMembers(req, res) {
    try {
      const { userId, level, page = 1, limit = 20 } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '用户ID不能为空'
        });
      }

      const user = this.users.get(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const teamRelation = this.teamRelations.get(userId) || { children: [], descendants: [] };
      let memberIds = [];

      if (level === '1') {
        // 直推成员（第一层）
        memberIds = teamRelation.children;
      } else {
        // 所有下级成员
        memberIds = teamRelation.descendants;
      }

      // 获取成员详细信息
      const members = memberIds.map(memberId => {
        const member = this.users.get(memberId);
        if (member) {
          return {
            id: member.id,
            username: member.username,
            level: member.level,
            joinTime: member.joinTime,
            status: member.status,
            totalInvites: member.totalInvites,
            directInvites: member.directInvites,
            teamSize: member.teamSize
          };
        }
        return null;
      }).filter(member => member !== null);

      // 分页处理
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedMembers = members.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          members: paginatedMembers,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: members.length,
            totalPages: Math.ceil(members.length / limit)
          }
        }
      });

    } catch (error) {
      console.error('获取团队成员失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 获取邀请链接
  async getInviteLink(req, res) {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '用户ID不能为空'
        });
      }

      const user = this.users.get(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:8000';
      const inviteLink = `${baseUrl}/invite.html?code=${user.inviteCode}`;

      res.json({
        success: true,
        data: {
          inviteCode: user.inviteCode,
          inviteLink: inviteLink,
          qrCode: `${baseUrl}/api/team/qrcode?code=${user.inviteCode}`,
          totalInvites: user.totalInvites,
          directInvites: user.directInvites
        }
      });

    } catch (error) {
      console.error('获取邀请链接失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 处理邀请注册
  async processInvite(req, res) {
    try {
      const { inviteCode, newUserId, username } = req.body;

      if (!inviteCode || !newUserId || !username) {
        return res.status(400).json({
          success: false,
          message: '邀请码、用户ID和用户名不能为空'
        });
      }

      // 查找邀请人
      let inviter = null;
      for (const [userId, user] of this.users.entries()) {
        if (user.inviteCode === inviteCode) {
          inviter = user;
          break;
        }
      }

      if (!inviter) {
        return res.status(404).json({
          success: false,
          message: '邀请码无效'
        });
      }

      // 检查新用户是否已存在
      if (this.users.has(newUserId)) {
        return res.status(400).json({
          success: false,
          message: '用户已存在'
        });
      }

      // 生成新用户邀请码
      const newInviteCode = `INV${Date.now().toString().slice(-6)}`;

      // 创建新用户
      const newUser = {
        id: newUserId,
        username: username,
        inviteCode: newInviteCode,
        inviterId: inviter.id,
        level: inviter.level + 1,
        totalInvites: 0,
        directInvites: 0,
        teamSize: 0,
        teamLevels: 0,
        joinTime: new Date().toISOString(),
        status: 'active'
      };

      this.users.set(newUserId, newUser);

      // 更新邀请人的团队数据
      inviter.totalInvites += 1;
      inviter.directInvites += 1;
      inviter.teamSize += 1;

      // 更新团队关系
      const inviterRelation = this.teamRelations.get(inviter.id) || { children: [], descendants: [], ancestors: [] };
      inviterRelation.children.push(newUserId);
      inviterRelation.descendants.push(newUserId);
      this.teamRelations.set(inviter.id, inviterRelation);

      // 创建新用户的团队关系
      this.teamRelations.set(newUserId, {
        children: [],
        descendants: [],
        ancestors: [...inviterRelation.ancestors, inviter.id]
      });

      res.json({
        success: true,
        message: '邀请注册成功',
        data: {
          newUser: {
            id: newUser.id,
            username: newUser.username,
            inviteCode: newUser.inviteCode,
            level: newUser.level
          },
          inviter: {
            id: inviter.id,
            username: inviter.username,
            totalInvites: inviter.totalInvites,
            directInvites: inviter.directInvites
          }
        }
      });

    } catch (error) {
      console.error('处理邀请注册失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 获取团队统计
  async getTeamStats(req, res) {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '用户ID不能为空'
        });
      }

      const user = this.users.get(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const teamStat = this.teamStats.get(userId) || {
        totalMembers: 0,
        activeMembers: 0,
        newMembersToday: 0,
        newMembersWeek: 0,
        levelDistribution: {},
        teamPerformance: { totalTasks: 0, completedTasks: 0, totalRewards: 0, teamBonus: 0 }
      };

      res.json({
        success: true,
        data: teamStat
      });

    } catch (error) {
      console.error('获取团队统计失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }
}

module.exports = TeamController;