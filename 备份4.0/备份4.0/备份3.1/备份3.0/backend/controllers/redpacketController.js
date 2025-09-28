const { pool, redisClient } = require('../config/database');
const moment = require('moment');

class RedpacketController {
  // 获取抢红包状态
  static getRedpacketStatus = async (req, res) => {
    try {
      const userId = req.query.userId || 'default';
      
      // 获取当前时间窗口状态
      const timeWindow = RedpacketController.getCurrentTimeWindow();
      
      // 获取今日红包记录
      const todayRecords = await RedpacketController.getTodayRecords(userId);
      
      // 获取最近红包记录
      const recentRecords = await RedpacketController.getRecentRecords(userId, 10);
      
      res.json({
        success: true,
        data: {
          timeWindow,
          todayRecords,
          recentRecords,
          nextWindow: RedpacketController.getNextWindow()
        }
      });
      
    } catch (error) {
      console.error('获取抢红包状态错误:', error);
      res.status(500).json({
        success: false,
        message: '获取抢红包状态失败'
      });
    }
  };

  // 抢红包
  static grabRedpacket = async (req, res) => {
    try {
      const userId = req.body.userId || 'default';
      
      // 检查时间窗口
      const timeWindow = RedpacketController.getCurrentTimeWindow();
      if (!timeWindow.eligible) {
        const nextWindow = RedpacketController.getNextWindow();
        return res.status(400).json({
          success: false,
          message: '不在抢红包时间窗口内',
          nextWindow
        });
      }
      
      // 检查今日是否已抢过
      const todayRecords = await RedpacketController.getTodayRecords(userId);
      const currentHour = moment().hour();
      const hasGrabbedThisWindow = todayRecords.some(record => {
        const recordHour = moment(record.grabbed_at).hour();
        return recordHour === currentHour;
      });
      
      if (hasGrabbedThisWindow) {
        return res.status(400).json({
          success: false,
          message: '本时间段已抢过红包'
        });
      }
      
      // 生成红包金额（随机1-100元）
      const amount = Math.floor(Math.random() * 100) + 1;
      
      // 记录红包抢夺
      const recordId = await RedpacketController.recordGrab(userId, amount);
      
      res.json({
        success: true,
        message: '抢红包成功！',
        data: {
          recordId,
          amount,
          grabbedAt: new Date().toISOString(),
          timeLeft: timeWindow.left
        }
      });
      
    } catch (error) {
      console.error('抢红包错误:', error);
      res.status(500).json({
        success: false,
        message: '抢红包失败'
      });
    }
  };

  // 获取红包记录
  static getRecords = async (req, res) => {
    try {
      const userId = req.query.userId || 'default';
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      
      const records = await RedpacketController.getRecentRecords(userId, limit, offset);
      const total = await RedpacketController.getTotalRecords(userId);
      
      res.json({
        success: true,
        data: {
          records,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
      
    } catch (error) {
      console.error('获取红包记录错误:', error);
      res.status(500).json({
        success: false,
        message: '获取红包记录失败'
      });
    }
  };

  // 获取当前时间窗口状态
  static getCurrentTimeWindow() {
    const now = moment();
    const hour = now.hour();
    const minute = now.minute();
    const second = now.second();
    
    // 三个时间窗口：9:00-9:01:17, 12:00-12:01:17, 20:00-20:01:17
    const windows = [
      { hour: 9, minute: 0 },
      { hour: 12, minute: 0 },
      { hour: 20, minute: 0 }
    ];
    
    for (const window of windows) {
      const start = moment().hour(window.hour).minute(window.minute).second(0);
      const end = moment(start).add(77, 'seconds');
      
      if (now.isBetween(start, end, null, '[]')) {
        const leftMs = end.diff(now);
        return {
          eligible: true,
          left: Math.floor(leftMs / 1000),
          windowStart: start.format('HH:mm:ss'),
          windowEnd: end.format('HH:mm:ss')
        };
      }
    }
    
    return { eligible: false };
  }

  // 获取下一个时间窗口
  static getNextWindow() {
    const now = moment();
    const windows = [
      { hour: 9, minute: 0 },
      { hour: 12, minute: 0 },
      { hour: 20, minute: 0 }
    ];
    
    for (const window of windows) {
      const windowTime = moment().hour(window.hour).minute(window.minute).second(0);
      if (now.isBefore(windowTime)) {
        return {
          time: windowTime.format('HH:mm'),
          countdown: windowTime.diff(now, 'seconds')
        };
      }
    }
    
    // 如果今天的窗口都过了，返回明天的第一个窗口
    const tomorrowFirst = moment().add(1, 'day').hour(9).minute(0).second(0);
    return {
      time: tomorrowFirst.format('MM-DD HH:mm'),
      countdown: tomorrowFirst.diff(now, 'seconds')
    };
  }

  // 获取今日红包记录
  static async getTodayRecords(userId) {
    try {
      // 使用Redis缓存
      const cacheKey = `redpacket:today:${userId}`;
      const cached = await redisClient.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }
      
      const today = moment().format('YYYY-MM-DD');
      const connection = await pool.getConnection();
      
      try {
        const [rows] = await connection.execute(
          `SELECT * FROM redpacket_records 
           WHERE user_id = ? AND DATE(grabbed_at) = ?
           ORDER BY grabbed_at DESC`,
          [userId, today]
        );
        
        // 缓存5分钟
        await redisClient.setEx(cacheKey, 300, JSON.stringify(rows));
        
        return rows;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('获取今日红包记录错误:', error);
      return [];
    }
  }

  // 获取最近红包记录
  static async getRecentRecords(userId, limit = 10, offset = 0) {
    try {
      const connection = await pool.getConnection();
      
      try {
        const [rows] = await connection.execute(
          `SELECT * FROM redpacket_records 
           WHERE user_id = ?
           ORDER BY grabbed_at DESC
           LIMIT ? OFFSET ?`,
          [userId, limit, offset]
        );
        
        return rows;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('获取最近红包记录错误:', error);
      return [];
    }
  }

  // 获取记录总数
  static async getTotalRecords(userId) {
    try {
      const connection = await pool.getConnection();
      
      try {
        const [rows] = await connection.execute(
          'SELECT COUNT(*) as total FROM redpacket_records WHERE user_id = ?',
          [userId]
        );
        
        return rows[0].total;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('获取记录总数错误:', error);
      return 0;
    }
  }

  // 记录红包抢夺
  static async recordGrab(userId, amount) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // 插入红包记录
      const [result] = await connection.execute(
        `INSERT INTO redpacket_records (user_id, amount, grabbed_at)
         VALUES (?, ?, NOW())`,
        [userId, amount]
      );
      
      // 更新用户余额（如果用户表存在balance字段）
      await connection.execute(
        `UPDATE users SET balance = balance + ? WHERE id = ?`,
        [amount, userId]
      );
      
      await connection.commit();
      
      // 清除今日缓存
      const cacheKey = `redpacket:today:${userId}`;
      await redisClient.del(cacheKey);
      
      return result.insertId;
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // 重置红包记录（测试用）
  static resetRecords = async (req, res) => {
    try {
      const userId = req.body.userId || 'default';
      
      const connection = await pool.getConnection();
      
      try {
        await connection.execute(
          'DELETE FROM redpacket_records WHERE user_id = ?',
          [userId]
        );
        
        // 清除缓存
        const cacheKey = `redpacket:today:${userId}`;
        await redisClient.del(cacheKey);
        
        res.json({
          success: true,
          message: '红包记录重置成功'
        });
        
      } finally {
        connection.release();
      }
      
    } catch (error) {
      console.error('重置红包记录错误:', error);
      res.status(500).json({
        success: false,
        message: '重置红包记录失败'
      });
    }
  };
}

module.exports = RedpacketController;