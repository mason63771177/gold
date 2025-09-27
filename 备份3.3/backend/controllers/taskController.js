const db = require('../config/database');
const webSocketService = require('../services/WebSocketService');

// 任务系统控制器
class TaskController {
  constructor() {
    // 模拟数据存储（实际项目中应使用数据库）
    this.users = new Map();
    this.initializeDefaultTasks();
  }

  // 初始化默认任务数据
  initializeDefaultTasks() {
    this.defaultNewbieTasks = [
      { id: 1, title: '直接推荐1人', desc: '邀请1位好友注册并激活账号', done: false, reward: 10 },
      { id: 2, title: '帮助下级推荐1人', desc: '指导你的下级成功邀请1位新用户', done: false, reward: 10 },
      { id: 3, title: '教下级如何教他的下级推荐1人', desc: '培训下级的推广技巧，帮助三级推广', done: false, reward: 10 }
    ];

    this.defaultQuizTasks = [
      { id: 'quiz1', title: '基础知识答题', desc: '完成20道基础题目，正确率达到80%', done: false, reward: 20, feeReduction: 0.02 }
    ];

    this.defaultGodTasks = [
      { id: 1, title: '大神任务一：直推2人 × 2层 = 6人', desc: '建立2层团队结构，每层2人', done: false, reward: 50 },
      { id: 2, title: '大神任务二：直推3人 × 3层 = 39人', desc: '建立3层团队结构，每层3人', done: false, reward: 250 },
      { id: 3, title: '大神任务三：直推4人 × 4层 = 340人', desc: '建立4层团队结构，每层4人', done: false, reward: 1250 },
      { id: 4, title: '大神任务四：直推5人 × 5层 = 3905人', desc: '建立5层团队结构，每层5人', done: false, reward: 6250 },
      { id: 5, title: '大神任务五：直推6人 × 6层 = 55986人', desc: '建立6层团队结构，每层6人', done: false, reward: 31250 },
      { id: 6, title: '大神任务六：直推7人 × 7层 = 960799人', desc: '建立7层团队结构，每层7人', done: false, reward: 156250 }
    ];
  }

  // 获取用户任务数据
  getUserTasks(userId = 'default') {
    if (!this.users.has(userId)) {
      this.users.set(userId, {
        newbieTasks: JSON.parse(JSON.stringify(this.defaultNewbieTasks)),
        quizTasks: JSON.parse(JSON.stringify(this.defaultQuizTasks)),
        godTasks: JSON.parse(JSON.stringify(this.defaultGodTasks)),
        completedNewbieTasks: 0,
        quizCompleted: false,
        godTasksUnlocked: false,
        godTasksCompleted: 0
      });
    }
    return this.users.get(userId);
  }

  // 获取任务列表（符合API规范）
  getTaskList = async (req, res) => {
    try {
      const userId = req.user?.id || 'default';
      const userTasks = this.getUserTasks(userId);

      // 计算完成的新手任务数量
      const completedNewbieTasks = userTasks.newbieTasks.filter(task => task.done).length;
      
      // 检查答题任务是否完成
      const quizCompleted = userTasks.quizTasks.every(task => task.done);
      
      // 检查大神任务是否解锁（需要完成所有新手任务和答题任务）
      const godTasksUnlocked = completedNewbieTasks >= 3 && quizCompleted;
      
      // 计算完成的大神任务数量
      const godTasksCompleted = userTasks.godTasks.filter(task => task.done).length;

      // 更新用户数据
      userTasks.completedNewbieTasks = completedNewbieTasks;
      userTasks.quizCompleted = quizCompleted;
      userTasks.godTasksUnlocked = godTasksUnlocked;
      userTasks.godTasksCompleted = godTasksCompleted;

      // 转换为API规范格式
      const newbieTasks = userTasks.newbieTasks.map(task => ({
        taskId: task.id,
        taskName: task.title,
        description: task.desc,
        reward: task.reward,
        status: task.done ? 'completed' : 'pending',
        progress: task.done ? '1/1' : '0/1'
      }));

      const quizTasks = userTasks.quizTasks.map(task => ({
        taskId: task.id,
        question: task.title,
        options: ["A. 通过社交媒体分享", "B. 提供优质服务", "C. 诚信推荐", "D. 以上都是"],
        status: task.done ? 'completed' : (completedNewbieTasks >= 1 ? 'pending' : 'locked')
      }));

      const masterTasks = userTasks.godTasks.map(task => ({
        taskId: task.id,
        taskName: task.title,
        description: task.desc,
        targetCount: parseInt(task.desc.match(/(\d+)人/)?.[1] || '0'),
        currentCount: task.done ? parseInt(task.desc.match(/(\d+)人/)?.[1] || '0') : 0,
        reward: task.reward,
        status: task.done ? 'completed' : (godTasksUnlocked ? 'pending' : 'locked')
      }));

      res.json({
        code: 200,
        message: 'success',
        data: {
          newbieTasks,
          quizTasks,
          masterTasks
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('获取任务列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取任务列表失败',
        timestamp: Date.now()
      });
    }
  }

  // 获取任务状态（保持兼容性）
  getTaskStatus = async (req, res) => {
    try {
      const userId = req.user?.id || 'default';
      const userTasks = this.getUserTasks(userId);

      // 计算完成的新手任务数量
      const completedNewbieTasks = userTasks.newbieTasks.filter(task => task.done).length;
      
      // 检查答题任务是否完成
      const quizCompleted = userTasks.quizTasks.every(task => task.done);
      
      // 检查大神任务是否解锁（需要完成所有新手任务和答题任务）
      const godTasksUnlocked = completedNewbieTasks >= 3 && quizCompleted;
      
      // 计算完成的大神任务数量
      const godTasksCompleted = userTasks.godTasks.filter(task => task.done).length;

      // 更新用户数据
      userTasks.completedNewbieTasks = completedNewbieTasks;
      userTasks.quizCompleted = quizCompleted;
      userTasks.godTasksUnlocked = godTasksUnlocked;
      userTasks.godTasksCompleted = godTasksCompleted;

      res.json({
        success: true,
        data: {
          newbieTasks: userTasks.newbieTasks,
          quizTasks: userTasks.quizTasks,
          godTasks: userTasks.godTasks,
          completedNewbieTasks,
          quizCompleted,
          godTasksUnlocked,
          godTasksCompleted
        }
      });
    } catch (error) {
      console.error('获取任务状态失败:', error);
      res.status(500).json({
        success: false,
        message: '获取任务状态失败'
      });
    }
  }

  // 完成任务（符合API规范）
  completeTask = async (req, res) => {
    try {
      const { taskId, taskType } = req.body;
      const userId = req.user?.id || 'default';
      
      if (!taskId || !taskType) {
        return res.status(400).json({
          code: 400,
          message: '任务ID和任务类型不能为空',
          timestamp: Date.now()
        });
      }

      const userTasks = this.getUserTasks(userId);
      let task = null;
      let reward = 0;

      if (taskType === 'newbie') {
        task = userTasks.newbieTasks.find(t => t.id === parseInt(taskId));
        
        if (!task) {
          return res.status(404).json({
            code: 404,
            message: '新手任务不存在',
            timestamp: Date.now()
          });
        }

        if (task.done) {
          return res.status(400).json({
            code: 400,
            message: '任务已完成',
            timestamp: Date.now()
          });
        }

        // 检查任务顺序（必须按0→1→2→3顺序完成）
        const completedCount = userTasks.newbieTasks.filter(t => t.done).length;
        if (task.id !== completedCount + 1) {
          return res.status(400).json({
            code: 400,
            message: '请按顺序完成任务',
            timestamp: Date.now()
          });
        }

        // 完成任务
        task.done = true;
        reward = task.reward;
        userTasks.completedNewbieTasks = userTasks.newbieTasks.filter(t => t.done).length;

      } else if (taskType === 'god' || taskType === 'master') {
        task = userTasks.godTasks.find(t => t.id === parseInt(taskId));
        
        if (!task) {
          return res.status(404).json({
            code: 404,
            message: '大神任务不存在',
            timestamp: Date.now()
          });
        }

        if (task.done) {
          return res.status(400).json({
            code: 400,
            message: '任务已完成',
            timestamp: Date.now()
          });
        }

        // 检查是否已解锁大神任务
        if (userTasks.completedNewbieTasks < 3 || !userTasks.quizCompleted) {
          return res.status(400).json({
            code: 400,
            message: '请先完成所有新手任务和答题任务',
            timestamp: Date.now()
          });
        }

        // 完成任务
        task.done = true;
        reward = task.reward;
        userTasks.godTasksCompleted = userTasks.godTasks.filter(t => t.done).length;
      } else {
        return res.status(400).json({
          code: 400,
          message: '不支持的任务类型',
          timestamp: Date.now()
        });
      }

      // 模拟更新钱包余额
      const currentBalance = 150.50; // 这里应该从钱包系统获取
      const newBalance = currentBalance + reward;

      // 发送任务完成通知
      webSocketService.sendTaskComplete(userId, {
        taskName: task.title,
        reward,
        message: `恭喜您完成任务：${task.title}`
      });

      res.json({
        code: 200,
        message: '任务完成',
        data: {
          reward,
          newBalance
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('完成任务失败:', error);
      res.status(500).json({
        code: 500,
        message: '完成任务失败',
        timestamp: Date.now()
      });
    }
  }

  // 答题接口（符合API规范）
  answerQuiz = async (req, res) => {
    try {
      const { questionId, answer } = req.body;
      const userId = req.user?.id || 'default';
      
      if (!questionId || !answer) {
        return res.status(400).json({
          code: 400,
          message: '问题ID和答案不能为空',
          timestamp: Date.now()
        });
      }

      const userTasks = this.getUserTasks(userId);
      
      // 检查是否已完成至少1个新手任务
      if (userTasks.completedNewbieTasks < 1) {
        return res.status(400).json({
          code: 400,
          message: '请先完成新手任务',
          timestamp: Date.now()
        });
      }

      const task = userTasks.quizTasks.find(t => t.id === questionId);
      
      if (!task) {
        return res.status(404).json({
          code: 404,
          message: '答题任务不存在',
          timestamp: Date.now()
        });
      }

      if (task.done) {
        return res.status(400).json({
          code: 400,
          message: '答题任务已完成',
          timestamp: Date.now()
        });
      }

      // 模拟答题逻辑（这里简化处理，实际应该有题库）
      const isCorrect = answer === 'D'; // 假设正确答案是D
      const currentFeeRate = 5.0 - (isCorrect ? task.feeReduction : 0);

      if (isCorrect) {
        task.done = true;
        userTasks.quizCompleted = userTasks.quizTasks.every(t => t.done);
      }

      res.json({
        code: 200,
        message: isCorrect ? '回答正确' : '回答错误',
        data: {
          correct: isCorrect,
          feeReduction: isCorrect ? task.feeReduction : 0,
          currentFeeRate
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('答题失败:', error);
      res.status(500).json({
        code: 500,
        message: '答题失败',
        timestamp: Date.now()
      });
    }
  }

  // 完成新手任务（保持兼容性）
  completeNewbieTask = async (req, res) => {
    try {
      const { taskId } = req.body;
      
      if (!taskId) {
        return res.status(400).json({
          success: false,
          message: '任务ID不能为空'
        });
      }

      const userTasks = this.getUserTasks(userId);
      const task = userTasks.newbieTasks.find(t => t.id === parseInt(taskId));
      
      if (!task) {
        return res.status(404).json({
          success: false,
          message: '任务不存在'
        });
      }

      if (task.done) {
        return res.status(400).json({
          success: false,
          message: '任务已完成'
        });
      }

      // 检查任务顺序（必须按0→1→2→3顺序完成）
      const completedCount = userTasks.newbieTasks.filter(t => t.done).length;
      if (task.id !== completedCount + 1) {
        return res.status(400).json({
          success: false,
          message: '请按顺序完成任务'
        });
      }

      // 完成任务
      task.done = true;
      userTasks.completedNewbieTasks = userTasks.newbieTasks.filter(t => t.done).length;

      // 检查是否解锁答题任务
      const shouldUnlockQuiz = userTasks.completedNewbieTasks >= 1 && !userTasks.quizCompleted;

      res.json({
        success: true,
        message: '任务完成成功',
        data: {
          taskId,
          reward: task.reward,
          completedNewbieTasks: userTasks.completedNewbieTasks,
          shouldUnlockQuiz,
          newbieTasks: userTasks.newbieTasks
        }
      });
    } catch (error) {
      console.error('完成新手任务失败:', error);
      res.status(500).json({
        success: false,
        message: '完成任务失败'
      });
    }
  }

  // 完成答题任务
  completeQuizTask = async (req, res) => {
    try {
      const { taskId, score, correctRate } = req.body;
      const userId = req.user?.id || 'default';
      
      if (!taskId) {
        return res.status(400).json({
          success: false,
          message: '任务ID不能为空'
        });
      }

      const userTasks = this.getUserTasks(userId);
      
      // 检查是否已完成至少1个新手任务
      if (userTasks.completedNewbieTasks < 1) {
        return res.status(400).json({
          success: false,
          message: '请先完成新手任务'
        });
      }

      const task = userTasks.quizTasks.find(t => t.id === taskId);
      
      if (!task) {
        return res.status(404).json({
          success: false,
          message: '答题任务不存在'
        });
      }

      if (task.done) {
        return res.status(400).json({
          success: false,
          message: '答题任务已完成'
        });
      }

      // 检查正确率（需要达到80%）
      if (correctRate < 0.8) {
        return res.status(400).json({
          success: false,
          message: '正确率不足80%，请重新答题'
        });
      }

      // 完成答题任务
      task.done = true;
      userTasks.quizCompleted = userTasks.quizTasks.every(t => t.done);

      // 检查是否解锁大神任务
      const shouldUnlockGodTasks = userTasks.completedNewbieTasks >= 3 && userTasks.quizCompleted;

      res.json({
        success: true,
        message: '答题任务完成成功',
        data: {
          taskId,
          reward: task.reward,
          feeReduction: task.feeReduction,
          score,
          correctRate,
          quizCompleted: userTasks.quizCompleted,
          shouldUnlockGodTasks,
          quizTasks: userTasks.quizTasks
        }
      });
    } catch (error) {
      console.error('完成答题任务失败:', error);
      res.status(500).json({
        success: false,
        message: '完成答题任务失败'
      });
    }
  }

  // 完成大神任务
  completeGodTask = async (req, res) => {
    try {
      const { taskId } = req.body;
      const userId = req.user?.id || 'default';
      
      if (!taskId) {
        return res.status(400).json({
          success: false,
          message: '任务ID不能为空'
        });
      }

      const userTasks = this.getUserTasks(userId);
      
      // 检查是否已解锁大神任务
      if (userTasks.completedNewbieTasks < 3 || !userTasks.quizCompleted) {
        return res.status(400).json({
          success: false,
          message: '请先完成所有新手任务和答题任务'
        });
      }

      const task = userTasks.godTasks.find(t => t.id === parseInt(taskId));
      
      if (!task) {
        return res.status(404).json({
          success: false,
          message: '大神任务不存在'
        });
      }

      if (task.done) {
        return res.status(400).json({
          success: false,
          message: '大神任务已完成'
        });
      }

      // 完成大神任务
      task.done = true;
      userTasks.godTasksCompleted = userTasks.godTasks.filter(t => t.done).length;

      res.json({
        success: true,
        message: '大神任务完成成功',
        data: {
          taskId,
          reward: task.reward,
          godTasksCompleted: userTasks.godTasksCompleted,
          godTasks: userTasks.godTasks
        }
      });
    } catch (error) {
      console.error('完成大神任务失败:', error);
      res.status(500).json({
        success: false,
        message: '完成大神任务失败'
      });
    }
  }

  // 重置任务（用于测试）
  resetTasks = async (req, res) => {
    try {
      const userId = req.user?.id || 'default';
      
      // 重置用户任务数据
      this.users.set(userId, {
        newbieTasks: JSON.parse(JSON.stringify(this.defaultNewbieTasks)),
        quizTasks: JSON.parse(JSON.stringify(this.defaultQuizTasks)),
        godTasks: JSON.parse(JSON.stringify(this.defaultGodTasks)),
        completedNewbieTasks: 0,
        quizCompleted: false,
        godTasksUnlocked: false,
        godTasksCompleted: 0
      });

      res.json({
        success: true,
        message: '任务重置成功'
      });
    } catch (error) {
      console.error('重置任务失败:', error);
      res.status(500).json({
        success: false,
        message: '重置任务失败'
      });
    }
  }
}

module.exports = new TaskController();