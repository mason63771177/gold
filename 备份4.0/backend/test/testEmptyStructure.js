const User = require('../models/User');
const Transaction = require('../models/Transaction');
const EmptyStructureService = require('../services/EmptyStructureService');
const EmptyStructureReportService = require('../services/EmptyStructureReportService');
const { pool } = require('../config/database');

/**
 * 空结构功能测试脚本
 * 测试各种场景下的资金分配逻辑
 */

class EmptyStructureTest {
  
  /**
   * 创建测试用户链条
   * @param {number} levels - 创建的层级数
   * @returns {Array} 用户ID数组，按层级排序
   */
  static async createTestUserChain(levels) {
    const users = [];
    let parentId = null;
    
    for (let i = 0; i < levels; i++) {
      const userData = {
        email: `test${Date.now()}_${i}@example.com`,
        password: 'test123456',
        telegram_username: `test_user_${Date.now()}_${i}`,
        status: 2, // 已激活状态
        balance: 0
      };
      
      // 如果有上级，设置邀请关系
      if (parentId) {
        const inviter = await User.findById(parentId);
        userData.inviterCode = inviter.invite_code;
      }
      
      const user = await User.create(userData);
      users.push(user.id);
      parentId = user.id;
    }
    
    return users.reverse(); // 返回从顶级到底级的用户ID数组
  }

  /**
   * 测试场景1：完整7层上级链条
   */
  static async testFullChain() {
    console.log('\n=== 测试场景1：完整7层上级链条 ===');
    
    try {
      // 创建7层用户链条
      const userChain = await this.createTestUserChain(8); // 8个用户，7层关系
      const newUserId = userChain[7]; // 最底层用户
      
      console.log('用户链条:', userChain);
      console.log($t('messages._____id_'), newUserId);
      
      // 处理空结构
      const result = await EmptyStructureService.processEmptyStructure(newUserId);
      
      console.log('处理结果:', {
        实际层级: result.distributionPlan.actualLevels,
        分配金额: result.distributionPlan.allocatedAmount,
        空结构金额: result.distributionPlan.emptyStructureAmount,
        奖励分配: result.distributionPlan.rewardDistribution.length
      });
      
      // 验证结果
      if (result.distributionPlan.actualLevels === 7 && 
          result.distributionPlan.emptyStructureAmount === 0) {
        console.log('✅ 测试通过：完整7层链条，无空结构资金');
      } else {
        console.log('❌ 测试失败：结果不符合预期');
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ 测试失败:', error.message);
      return null;
    }
  }

  /**
   * 测试场景2：只有3层上级链条
   */
  static async testPartialChain() {
    console.log($t('messages._n________2'));
    
    try {
      // 创建3层用户链条
      const userChain = await this.createTestUserChain(4); // 4个用户，3层关系
      const newUserId = userChain[3]; // 最底层用户
      
      console.log('用户链条:', userChain);
      console.log($t('messages._____id_'), newUserId);
      
      // 处理空结构
      const result = await EmptyStructureService.processEmptyStructure(newUserId);
      
      console.log('处理结果:', {
        实际层级: result.distributionPlan.actualLevels,
        分配金额: result.distributionPlan.allocatedAmount,
        空结构金额: result.distributionPlan.emptyStructureAmount,
        奖励分配: result.distributionPlan.rewardDistribution.length
      });
      
      // 验证结果
      if (result.distributionPlan.actualLevels === 3 && 
          result.distributionPlan.emptyStructureAmount === 40) {
        console.log('✅ 测试通过：3层链条，40 USDT空结构资金');
      } else {
        console.log('❌ 测试失败：结果不符合预期');
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ 测试失败:', error.message);
      return null;
    }
  }

  /**
   * 测试场景3：没有上级（孤立用户）
   */
  static async testIsolatedUser() {
    console.log($t('messages._n________3'));
    
    try {
      // 创建孤立用户
      const user = await User.create({
        email: `isolated${Date.now()}@example.com`,
        password: 'test123456',
        telegram_username: `isolated_user_${Date.now()}`,
        status: 2,
        balance: 0
      });
      
      console.log($t('messages.____id_'), user.id);
      
      // 处理空结构
      const result = await EmptyStructureService.processEmptyStructure(user.id);
      
      console.log('处理结果:', {
        实际层级: result.distributionPlan.actualLevels,
        分配金额: result.distributionPlan.allocatedAmount,
        空结构金额: result.distributionPlan.emptyStructureAmount,
        奖励分配: result.distributionPlan.rewardDistribution.length
      });
      
      // 验证结果
      if (result.distributionPlan.actualLevels === 0 && 
          result.distributionPlan.emptyStructureAmount === 70) {
        console.log('✅ 测试通过：孤立用户，70 USDT空结构资金');
      } else {
        console.log('❌ 测试失败：结果不符合预期');
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ 测试失败:', error.message);
      return null;
    }
  }

  /**
   * 测试场景4：验证余额更新
   */
  static async testBalanceUpdate() {
    console.log($t('messages._n________4'));
    
    try {
      // 创建2层用户链条
      const userChain = await this.createTestUserChain(3); // 3个用户，2层关系
      const newUserId = userChain[2]; // 最底层用户
      
      // 记录处理前的余额
      const beforeBalances = {};
      for (const userId of userChain.slice(0, 2)) { // 只检查上级用户
        const user = await User.findById(userId);
        beforeBalances[userId] = user.balance;
      }
      
      console.log('处理前余额:', beforeBalances);
      
      // 处理空结构
      const result = await EmptyStructureService.processEmptyStructure(newUserId);
      
      // 记录处理后的余额
      const afterBalances = {};
      for (const userId of userChain.slice(0, 2)) {
        const user = await User.findById(userId);
        afterBalances[userId] = user.balance;
      }
      
      console.log('处理后余额:', afterBalances);
      
      // 验证余额变化
      let balanceUpdateCorrect = true;
      for (const userId of userChain.slice(0, 2)) {
        const expectedIncrease = 10; // 每层10 USDT
        const actualIncrease = afterBalances[userId] - beforeBalances[userId];
        if (actualIncrease !== expectedIncrease) {
          balanceUpdateCorrect = false;
          console.log(`❌ 用户${userId}余额增加不正确: 期望${expectedIncrease}, 实际${actualIncrease}`);
        }
      }
      
      if (balanceUpdateCorrect) {
        console.log('✅ 测试通过：余额更新正确');
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ 测试失败:', error.message);
      return null;
    }
  }

  /**
   * 测试场景5：验证交易记录
   */
  static async testTransactionRecords() {
    console.log($t('messages._n________5'));
    
    try {
      // 创建1层用户链条
      const userChain = await this.createTestUserChain(2); // 2个用户，1层关系
      const newUserId = userChain[1]; // 最底层用户
      
      // 处理空结构
      const result = await EmptyStructureService.processEmptyStructure(newUserId);
      
      // 检查奖励交易记录
      const [rewardTransactions] = await pool.execute(`
        SELECT * FROM transactions 
        WHERE type = 'multi_level_reward' 
        AND related_user_id = ?
        ORDER BY created_at DESC
      `, [newUserId]);
      
      // 检查空结构资金交易记录
      const [emptyStructureTransactions] = await pool.execute(`
        SELECT * FROM transactions 
        WHERE type = 'empty_structure_fund' 
        AND related_user_id = ?
        ORDER BY created_at DESC
      `, [newUserId]);
      
      console.log('奖励交易记录数量:', rewardTransactions.length);
      console.log('空结构交易记录数量:', emptyStructureTransactions.length);
      
      // 验证交易记录
      if (rewardTransactions.length === 1 && emptyStructureTransactions.length === 1) {
        console.log('✅ 测试通过：交易记录创建正确');
        
        // 验证空结构交易金额
        const emptyTx = emptyStructureTransactions[0];
        if (emptyTx.amount === 60) { // 7-1=6层缺失，6*10=60 USDT
          console.log($t('messages.____________'));
        } else {
          console.log(`❌ 空结构交易金额错误: 期望60, 实际${emptyTx.amount}`);
        }
      } else {
        console.log('❌ 测试失败：交易记录数量不正确');
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ 测试失败:', error.message);
      return null;
    }
  }

  /**
   * 运行所有测试
   */
  static async runAllTests() {
    console.log($t('messages.________________n'));
    
    const results = [];
    
    // 运行各个测试场景
    results.push(await this.testFullChain());
    results.push(await this.testPartialChain());
    results.push(await this.testIsolatedUser());
    results.push(await this.testBalanceUpdate());
    results.push(await this.testTransactionRecords());
    
    // 测试报告服务
    console.log($t('messages._n_____________'));
    try {
      const report = await EmptyStructureReportService.getEmptyStructureReport({
        limit: 10
      });
      console.log('报告统计:', report.data.statistics);
      console.log('✅ 报告服务测试通过');
    } catch (error) {
      console.error('❌ 报告服务测试失败:', error.message);
    }
    
    console.log($t('messages._n_________'));
    
    // 统计测试结果
    const successCount = results.filter(r => r !== null).length;
    console.log(`✅ 成功: ${successCount}/${results.length}`);
    
    return results;
  }

  /**
   * 清理测试数据
   */
  static async cleanup() {
    console.log($t('messages._n____________'));
    
    try {
      // 删除测试用户
      await pool.execute(`
        DELETE FROM users 
        WHERE telegram_username LIKE 'test_user_%' 
        OR telegram_username LIKE 'isolated_user_%'
      `);
      
      // 删除测试交易记录
      await pool.execute(`
        DELETE FROM transactions 
        WHERE description LIKE '%测试%' 
        OR type IN ('multi_level_reward', 'empty_structure_fund')
      `);
      
      console.log('✅ 测试数据清理完成');
    } catch (error) {
      console.error($t('messages.___________'), error.message);
    }
  }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  (async () => {
    try {
      await EmptyStructureTest.runAllTests();
      await EmptyStructureTest.cleanup();
      process.exit(0);
    } catch (error) {
      console.error('测试执行失败:', error);
      process.exit(1);
    }
  })();
}

module.exports = EmptyStructureTest;