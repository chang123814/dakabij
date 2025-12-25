-- 习惯日记小程序 - 数据库初始化脚本
-- 数据库名称：dakabiji
-- 创建日期：2025年

-- ============================================
-- 1. 用户表 (users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    openid VARCHAR(100) UNIQUE NOT NULL COMMENT '微信OpenID',
    nickname VARCHAR(50) COMMENT '用户昵称',
    avatar_url VARCHAR(255) COMMENT '头像URL',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================
-- 2. 习惯表 (habits)
-- ============================================
CREATE TABLE IF NOT EXISTS habits (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '习惯ID',
    user_id INT NOT NULL COMMENT '用户ID',
    name VARCHAR(100) NOT NULL COMMENT '习惯名称',
    description VARCHAR(500) COMMENT '习惯描述',
    icon VARCHAR(50) COMMENT '图标',
    color VARCHAR(20) COMMENT '颜色',
    frequency_type ENUM('daily','weekly','monthly') DEFAULT 'daily' COMMENT '频率类型',
    target_count INT DEFAULT 1 COMMENT '目标次数',
    reminder_time TIME COMMENT '提醒时间',
    reminder_enabled TINYINT DEFAULT 0 COMMENT '是否开启提醒',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '结束日期',
    status TINYINT DEFAULT 1 COMMENT '状态：1-进行中，0-已停用',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='习惯表';

-- ============================================
-- 3. 打卡记录表 (check_in_records)
-- ============================================
CREATE TABLE IF NOT EXISTS check_in_records (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    habit_id INT NOT NULL COMMENT '习惯ID',
    user_id INT NOT NULL COMMENT '用户ID',
    check_in_date DATE NOT NULL COMMENT '打卡日期',
    check_in_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '打卡时间',
    note VARCHAR(500) COMMENT '备注',
    mood TINYINT COMMENT '心情：1-很差，2-差，3-一般，4-好，5-很好',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_habit_date (habit_id, check_in_date),
    INDEX idx_user_date (user_id, check_in_date),
    INDEX idx_check_in_date (check_in_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='打卡记录表';

-- ============================================
-- 4. 笔记表 (notes)
-- ============================================
CREATE TABLE IF NOT EXISTS notes (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '笔记ID',
    user_id INT NOT NULL COMMENT '用户ID',
    title VARCHAR(200) NOT NULL COMMENT '笔记标题',
    content TEXT COMMENT '笔记内容',
    category_id INT COMMENT '分类ID',
    tags VARCHAR(500) COMMENT '标签（逗号分隔）',
    is_public TINYINT DEFAULT 0 COMMENT '是否公开：1-公开，0-私有',
    view_count INT DEFAULT 0 COMMENT '查看次数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='笔记表';

-- ============================================
-- 5. 笔记分类表 (note_categories)
-- ============================================
CREATE TABLE IF NOT EXISTS note_categories (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
    user_id INT NOT NULL COMMENT '用户ID',
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    icon VARCHAR(50) COMMENT '图标',
    color VARCHAR(20) COMMENT '颜色',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='笔记分类表';

-- ============================================
-- 6. 习惯情境表 (habit_scenes)
-- ============================================
CREATE TABLE IF NOT EXISTS habit_scenes (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '情境ID',
    user_id INT NOT NULL COMMENT '用户ID',
    name VARCHAR(50) NOT NULL COMMENT '情境名称',
    description VARCHAR(200) COMMENT '情境描述',
    icon VARCHAR(50) COMMENT '图标',
    background_color VARCHAR(20) COMMENT '背景颜色',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='习惯情境表';

-- ============================================
-- 7. 习惯情境关联表 (habit_scene_relations)
-- ============================================
CREATE TABLE IF NOT EXISTS habit_scene_relations (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '关联ID',
    scene_id INT NOT NULL COMMENT '情境ID',
    habit_id INT NOT NULL COMMENT '习惯ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (scene_id) REFERENCES habit_scenes(id) ON DELETE CASCADE,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE KEY uk_scene_habit (scene_id, habit_id),
    INDEX idx_scene_id (scene_id),
    INDEX idx_habit_id (habit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='习惯情境关联表';

-- ============================================
-- 8. 统计数据表 (statistics)
-- ============================================
CREATE TABLE IF NOT EXISTS statistics (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '统计ID',
    user_id INT NOT NULL COMMENT '用户ID',
    stat_date DATE NOT NULL COMMENT '统计日期',
    total_habits INT DEFAULT 0 COMMENT '总习惯数',
    active_habits INT DEFAULT 0 COMMENT '活跃习惯数',
    checked_in_count INT DEFAULT 0 COMMENT '打卡次数',
    total_notes INT DEFAULT 0 COMMENT '总笔记数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_date (user_id, stat_date),
    INDEX idx_stat_date (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='统计数据表';

-- ============================================
-- 初始化数据
-- ============================================

-- 插入默认笔记分类（可选）
INSERT INTO note_categories (user_id, name, icon, color, sort_order) VALUES
(0, '生活', 'life', '#FF6B6B', 1),
(0, '工作', 'work', '#4ECDC4', 2),
(0, '学习', 'study', '#45B7D1', 3),
(0, '健康', 'health', '#96CEB4', 4),
(0, '其他', 'other', '#FFEAA7', 5)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ============================================
-- 验证表创建
-- ============================================
SHOW TABLES;

-- 显示表结构
DESC users;
DESC habits;
DESC check_in_records;
DESC notes;
DESC note_categories;
DESC habit_scenes;
DESC habit_scene_relations;
DESC statistics;

-- ============================================
-- 完成
-- ============================================
SELECT '数据库初始化完成！' AS message;
