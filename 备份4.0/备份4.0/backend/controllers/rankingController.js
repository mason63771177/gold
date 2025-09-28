class RankingController {
  constructor() {
    // 内存存储模拟数据
    
    // 团队排行榜数据
    this.teamRankings = [
      {
        rank: 1,
        userId: 'user001',
        username: '团队之王',
        teamCount: 500,
        directCount: 25
      },
      {
        rank: 2,
        userId: 'user002',
        username: '招募达人',
        teamCount: 350,
        directCount: 18
      },
      {
        rank: 3,
        userId: 'user003',
        username: '团队领袖',
        teamCount: 280,
        directCount: 15
      },
      {
        rank: 4,
        userId: 'user004',
        username: '组织专家',
        teamCount: 220,
        directCount: 12
      },
      {
        rank: 5,
        userId: 'user005',
        username: '团队建设者',
        teamCount: 180,
        directCount: 10
      },
      {
        rank: 6,
        userId: 'user006',
        username: '招募高手',
        teamCount: 150,
        directCount: 8
      },
      {
        rank: 7,
        userId: 'user007',
        username: '团队管理',
        teamCount: 135,
        directCount: 7
      },
      {
        rank: 8,
        userId: 'default',
        username: $t('messages.__001'),
        teamCount: 127,
        directCount: 8
      }
    ];

    // 红包排行榜数据
    this.redpacketRankings = [
      {
        rank: 1,
        userId: 'user001',
        username: '红包王者',
        totalAmount: 1250.50
      },
      {
        rank: 2,
        userId: 'user002',
        username: '幸运之星',
        totalAmount: 980.25
      },
      {
        rank: 3,
        userId: 'user003',
        username: '抢包达人',
        totalAmount: 750.80
      },
      {
        rank: 4,
        userId: 'user004',
        username: '手速之王',
        totalAmount: 650.30
      },
      {
        rank: 5,
        userId: 'user005',
        username: '红包猎手',
        totalAmount: 520.75
      },
      {
        rank: 6,
        userId: 'user006',
        username: '幸运玩家',
        totalAmount: 450.60
      },
      {
        rank: 7,
        userId: 'user007',
        username: '抢包高手',
        totalAmount: 380.40
      },
      {
        rank: 8,
        userId: 'default',
        username: $t('messages.__001'),
        totalAmount: 325.75
      }
    ];

    // 大神排行榜数据
    this.masterRankings = [
      {
        rank: 1,
        userId: 'user001',
        username: '超级大神',
        masterLevel: 5,
        teamCount: 500,
        achieveTime: Date.now() - 86400000 * 30
      },
      {
        rank: 2,
        userId: 'user002',
        username: '顶级大神',
        masterLevel: 4,
        teamCount: 350,
        achieveTime: Date.now() - 86400000 * 25
      },
      {
        rank: 3,
        userId: 'user003',
        username: '高级大神',
        masterLevel: 4,
        teamCount: 280,
        achieveTime: Date.now() - 86400000 * 20
      },
      {
        rank: 4,
        userId: 'user004',
        username: '中级大神',
        masterLevel: 3,
        teamCount: 220,
        achieveTime: Date.now() - 86400000 * 15
      },
      {
        rank: 5,
        userId: 'user005',
        username: '初级大神',
        masterLevel: 3,
        teamCount: 180,
        achieveTime: Date.now() - 86400000 * 10
      },
      {
        rank: 6,
        userId: 'user006',
        username: '准大神',
        masterLevel: 2,
        teamCount: 150,
        achieveTime: Date.now() - 86400000 * 8
      },
      {
        rank: 7,
        userId: 'user007',
        username: '新晋大神',
        masterLevel: 2,
        teamCount: 135,
        achieveTime: Date.now() - 86400000 * 5
      },
      {
        rank: 12,
        userId: 'default',
        username: $t('messages.__001'),
        masterLevel: 1,
        teamCount: 127,
        achieveTime: Date.now() - 86400000 * 3
      }
    ];
  }

  // 获取团队排行榜（符合API规范）
  getTeamRanking = async (req, res) => {
    try {
      const { type = 'total', period = 'personal' } = req.query;
      const userId = req.user?.id || 'default';

      // 根据类型和周期过滤数据（这里简化处理，实际应该根据参数查询不同数据）
      let rankings = [...this.teamRankings];
      
      // 查找当前用户排名
      const myRank = rankings.find(item => item.userId === userId);

      res.json({
        code: 200,
        message: 'success',
        data: {
          rankings: rankings.slice(0, 10), // 返回前10名
          myRank: myRank ? {
            rank: myRank.rank,
            teamCount: myRank.teamCount,
            directCount: myRank.directCount
          } : null
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('获取团队排行榜失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取团队排行榜失败',
        timestamp: Date.now()
      });
    }
  }

  // 获取红包排行榜（符合API规范）
  getRedpacketRanking = async (req, res) => {
    try {
      const userId = req.user?.id || 'default';

      let rankings = [...this.redpacketRankings];
      
      // 查找当前用户排名
      const myRank = rankings.find(item => item.userId === userId);

      res.json({
        code: 200,
        message: 'success',
        data: {
          rankings: rankings.slice(0, 10), // 返回前10名
          myRank: myRank ? {
            rank: myRank.rank,
            totalAmount: myRank.totalAmount
          } : null
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('获取红包排行榜失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取红包排行榜失败',
        timestamp: Date.now()
      });
    }
  }

  // 获取大神排行榜（符合API规范）
  getMasterRanking = async (req, res) => {
    try {
      const userId = req.user?.id || 'default';

      let rankings = [...this.masterRankings];
      
      // 查找当前用户排名
      const myRank = rankings.find(item => item.userId === userId);

      res.json({
        code: 200,
        message: 'success',
        data: {
          rankings: rankings.slice(0, 10), // 返回前10名
          myRank: myRank ? {
            rank: myRank.rank,
            masterLevel: myRank.masterLevel,
            teamCount: myRank.teamCount
          } : null
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('获取大神排行榜失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取大神排行榜失败',
        timestamp: Date.now()
      });
    }
  }
}

module.exports = RankingController;