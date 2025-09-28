const mysql = require('mysql2/promise');
require('dotenv').config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  charset: 'utf8mb4'
};

// 创建数据库和表的SQL语句
const createDatabaseSQL = `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'gold7_game'} 
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;

const createTablesSQL = [
  // 用户表
  `CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255) NULL,
    verification_token_expires DATETIME NULL,
    password_reset_token VARCHAR(255) NULL,
    password_reset_expires DATETIME NULL,
    telegram_id VARCHAR(50) NULL,
    telegram_username VARCHAR(100) NULL,
    invite_code VARCHAR(20) NOT NULL UNIQUE,
    inviter_code VARCHAR(20) NULL,
    inviter_id INT NULL,
    status TINYINT DEFAULT 1 COMMENT $t('messages.1_____2____'),
    balance DECIMAL(15,2) DEFAULT 0.00,
    frozen_balance DECIMAL(15,2) DEFAULT 0.00,
    total_earnings DECIMAL(15,2) DEFAULT 0.00,
    team_count INT DEFAULT 0,
    activation_count INT DEFAULT 0,
    last_activation_time DATETIME NULL,
    countdown_end_time DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_invite_code (invite_code),
    INDEX idx_inviter_code (inviter_code),
    INDEX idx_inviter_id (inviter_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // 任务表
  `CREATE TABLE IF NOT EXISTS tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    task_type ENUM('newbie', 'quiz', 'master') NOT NULL,
    task_index INT NOT NULL COMMENT '任务序号',
    status ENUM('pending', 'completed') DEFAULT 'pending',
    reward_amount DECIMAL(10,2) DEFAULT 0.00,
    completed_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_task (user_id, task_type, task_index),
    INDEX idx_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // 答题记录表
  `CREATE TABLE IF NOT EXISTS quiz_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    question_id INT NOT NULL,
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_question_id (question_id),
    INDEX idx_completed_at (completed_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // 红包活动表
  `CREATE TABLE IF NOT EXISTS redpacket_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL COMMENT '09:00, 12:00, 20:00',
    total_amount DECIMAL(15,2) NOT NULL,
    participant_count INT DEFAULT 0,
    status ENUM('pending', 'active', 'completed') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_event (event_date, event_time),
    INDEX idx_status (status),
    INDEX idx_event_date (event_date)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // 红包记录表
  `CREATE TABLE IF NOT EXISTS redpacket_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    grabbed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_id (event_id),
    INDEX idx_user_id (user_id),
    INDEX idx_grabbed_at (grabbed_at),
    FOREIGN KEY (event_id) REFERENCES redpacket_events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // 钱包交易表
  `CREATE TABLE IF NOT EXISTS wallet_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('activation', 'task_reward', 'redpacket', 'team_commission', 'withdrawal', 'refund') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    transaction_hash VARCHAR(100) NULL COMMENT '区块链交易哈希',
    description TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_transaction_hash (transaction_hash),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // 团队关系表
  `CREATE TABLE IF NOT EXISTS team_relations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    inviter_id INT NOT NULL,
    level TINYINT NOT NULL COMMENT $t('messages.___1_7'),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_inviter_id (inviter_id),
    INDEX idx_level (level),
    INDEX idx_inviter_level (inviter_id, level),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // 激活订单表
  `CREATE TABLE IF NOT EXISTS activation_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'confirmed', 'failed') DEFAULT 'pending',
    payment_address VARCHAR(100) NULL,
    transaction_hash VARCHAR(100) NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_transaction_hash (transaction_hash),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // 系统配置表
  `CREATE TABLE IF NOT EXISTS system_configs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    description TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_config_key (config_key)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // 通知记录表
  `CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL COMMENT $t('messages.null______'),
    type ENUM('system', 'activation', 'redpacket', 'task', 'team') NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
];

// 初始化数据
const initDataSQL = [
  // 系统配置
  `INSERT IGNORE INTO system_configs (config_key, config_value, description) VALUES
    ('activation_amount', '100', $t('messages._____usdt_')),
    ('countdown_hours', '168', '倒计时小时数'),
    ('redpacket_times', '09:00,12:00,20:00', '红包时间'),
    ('redpacket_duration', '77', '红包持续时间(秒)'),
    ('withdrawal_fee_fixed', '5', $t('messages.________usdt_')),
    ('withdrawal_fee_variable', '0.05', '浮动提现手续费比例'),
    ('withdrawal_min_amount', '10', '最小提现金额(USDT)'),
    ('withdrawal_max_amount', '10000', '最大提现金额(USDT)'),
    ('withdrawal_daily_limit', '50000', $t('messages._______usdt_'))`,

  // 创建测试用户
  `INSERT IGNORE INTO users (email, password, invite_code, status) VALUES
    ('admin@gold7.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGtrmu3VG', 'ADMIN1', 2)`
];

async function initDatabase() {
  let connection;
  
  try {
    console.log('🔄 开始初始化数据库...');
    
    // 连接MySQL（不指定数据库）
    connection = await mysql.createConnection(dbConfig);
    console.log($t('messages.____mysql__'));
    
    // 创建数据库
    await connection.query(createDatabaseSQL);
    console.log('✅ 数据库创建成功');
    
    // 切换到目标数据库
    await connection.query(`USE ${process.env.DB_NAME || 'gold7_game'}`);
    console.log('✅ 切换到目标数据库');
    
    // 创建表
    for (let i = 0; i < createTablesSQL.length; i++) {
      await connection.query(createTablesSQL[i]);
      console.log(`✅ 表 ${i + 1}/${createTablesSQL.length} 创建成功`);
    }
    
    // 插入初始数据
    for (const sql of initDataSQL) {
      await connection.query(sql);
    }
    console.log('✅ 初始数据插入成功');
    
    console.log('🎉 数据库初始化完成！');
    
    // 显示测试账号信息
    console.log($t('messages._n__________'));
    console.log('邮箱: admin@gold7.com');
    console.log($t('messages.____admin123'));
    console.log($t('messages._____admin1'));
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };