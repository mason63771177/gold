const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
require('dotenv').config();

const { testConnection, closeConnections } = require('./config/database');
const webSocketService = require('./services/WebSocketService');
const countdownService = require('./services/CountdownService');
const authRoutes = require('./routes/auth');
const stateRoutes = require('./routes/state');
const taskRoutes = require('./routes/tasks');
const redpacketRoutes = require('./routes/redpacket');
const walletRoutes = require('./routes/wallet');
const teamRoutes = require('./routes/team');
const rankingRoutes = require('./routes/ranking');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // 生产环境域名
    : ['http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:8001', 'http://127.0.0.1:8001'], // 开发环境
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // 支持旧版浏览器
}));

// 全局限流
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(globalLimiter);

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 路由配置
app.use('/api/auth', authRoutes);
app.use('/api/user', require('./routes/user'));
app.use('/api/state', stateRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/redpacket', redpacketRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/activation', require('./routes/activation'));
app.use('/api/empty-structure', require('./routes/emptyStructure'));
app.use('/api/websocket', require('./routes/websocket'));

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 全局错误处理
app.use((error, req, res, next) => {
  console.error('全局错误:', error);
  
  // 数据库错误
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message: '数据已存在'
    });
  }
  
  // JWT错误
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: '无效的访问令牌'
    });
  }
  
  // 验证错误
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: '数据验证失败',
      errors: error.errors
    });
  }
  
  // 默认错误
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? '服务器内部错误' 
      : error.message
  });
});

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.warn('⚠️ 数据库连接失败，服务器将在无数据库模式下运行');
      console.warn('⚠️ 某些功能可能不可用，建议配置数据库');
    }
    
    // 创建HTTP服务器
    const server = http.createServer(app);
    
    // 初始化WebSocket服务
    webSocketService.initialize(server);
    
    // 启动HTTP服务器
    server.listen(PORT, () => {
      console.log(`🚀 服务器运行在端口 ${PORT}`);
      console.log(`📍 健康检查: http://localhost:${PORT}/health`);
      console.log(`🔗 API文档: http://localhost:${PORT}/api`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
      console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
    });
    
    // 优雅关闭
    const gracefulShutdown = async (signal) => {
      console.log(`\n📡 收到 ${signal} 信号，开始优雅关闭...`);
      
      server.close(async () => {
        console.log($t('messages.___http______'));
        
        // 关闭WebSocket服务
        webSocketService.close();
        
        // 关闭数据库连接
        await closeConnections();
        
        console.log('✅ 服务器已优雅关闭');
        process.exit(0);
      });
      
      // 强制关闭超时
      setTimeout(() => {
        console.error('❌ 强制关闭服务器');
        process.exit(1);
      }, 10000);
    };
    
    // 监听关闭信号
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // 监听未捕获的异常
    process.on('uncaughtException', (error) => {
      console.error('❌ 未捕获的异常:', error);
      gracefulShutdown('uncaughtException');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error($t('messages.______promise___'), reason);
      gracefulShutdown('unhandledRejection');
    });
    
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer();

module.exports = app;