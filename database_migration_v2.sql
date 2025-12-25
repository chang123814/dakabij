-- 习惯日记小程序 - 数据库迁移脚本 V2.0
-- 创建日期：2025-01-01
-- 说明：添加打卡表功能模块和素材收集笔记功能模块相关表结构

-- ============================================
-- 1. 新增表结构
-- ============================================

-- 1.1 任务分类表 (task_categories)
CREATE TABLE IF NOT EXISTS task_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    icon VARCHAR(50) COMMENT '图标',
    color VARCHAR(20) COMMENT '颜色',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务分类表';

-- 1.2 素材分类表 (material_categories)
CREATE TABLE IF NOT EXISTS material_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    icon VARCHAR(50) COMMENT '图标',
    color VARCHAR(20) COMMENT '颜色',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='素材分类表';

-- 1.3 素材表 (materials)
CREATE TABLE IF NOT EXISTS materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category_id INT COMMENT '分类ID',
    title VARCHAR(200) NOT NULL COMMENT '素材标题',
    content TEXT COMMENT '素材内容',
    material_type VARCHAR(50) DEFAULT 'inspiration' COMMENT '素材类型：inspiration-灵感，quote-金句，keyword-关键词，image-图片，tip-技巧',
    source VARCHAR(200) COMMENT '来源',
    image_url VARCHAR(500) COMMENT '图片URL',
    tags VARCHAR(500) COMMENT '标签（逗号分隔）',
    is_favorite TINYINT DEFAULT 0 COMMENT '是否收藏：1-收藏，0-未收藏',
    view_count INT DEFAULT 0 COMMENT '查看次数',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-删除',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES material_categories(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id),
    INDEX idx_material_type (material_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='素材表';

-- 1.4 标签表 (tags)
CREATE TABLE IF NOT EXISTS tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL COMMENT '标签名称',
    color VARCHAR(20) COMMENT '颜色',
    tag_type VARCHAR(50) DEFAULT 'material' COMMENT '标签类型：material-素材，task-任务，content-内容',
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-删除',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_tag_type (tag_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签表';

-- 1.5 社交平台表 (social_platforms)
CREATE TABLE IF NOT EXISTS social_platforms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    platform_name VARCHAR(50) NOT NULL COMMENT '平台名称：小红书、抖音、B站等',
    platform_code VARCHAR(50) NOT NULL COMMENT '平台代码：xiaohongshu、douyin、bilibili等',
    account_id VARCHAR(100) COMMENT '账号ID',
    account_name VARCHAR(100) COMMENT '账号名称',
    avatar_url VARCHAR(255) COMMENT '头像',
    follower_count INT DEFAULT 0 COMMENT '粉丝数',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_platform_code (platform_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社交平台表';

-- 1.6 内容发布表 (content_publish)
CREATE TABLE IF NOT EXISTS content_publish (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    habit_id INT COMMENT '关联的习惯ID',
    platform_id INT COMMENT '发布平台ID',
    title VARCHAR(200) COMMENT '内容标题',
    content TEXT COMMENT '内容描述',
    tags VARCHAR(500) COMMENT '标签',
    publish_time DATETIME COMMENT '发布时间',
    view_count INT DEFAULT 0 COMMENT '播放量',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    comment_count INT DEFAULT 0 COMMENT '评论数',
    collect_count INT DEFAULT 0 COMMENT '收藏数',
    share_count INT DEFAULT 0 COMMENT '分享数',
    fan_increase INT DEFAULT 0 COMMENT '粉丝增长数',
    satisfaction_score TINYINT COMMENT '满意度评分1-5',
    notes TEXT COMMENT '备注',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-删除',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE SET NULL,
    FOREIGN KEY (platform_id) REFERENCES social_platforms(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_platform_id (platform_id),
    INDEX idx_publish_time (publish_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容发布表';

-- 1.7 风格测试表 (style_tests)
CREATE TABLE IF NOT EXISTS style_tests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    style_name VARCHAR(100) NOT NULL COMMENT '风格名称',
    keywords VARCHAR(500) COMMENT '关键词组合',
    generate_count INT DEFAULT 0 COMMENT '生成张数',
    satisfaction_score TINYINT COMMENT '满意度评分1-5',
    test_date DATE COMMENT '测试日期',
    notes TEXT COMMENT '备注',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-删除',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_test_date (test_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='风格测试表';

-- 1.8 粉丝互动表 (fan_interactions)
CREATE TABLE IF NOT EXISTS fan_interactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    interaction_type VARCHAR(50) NOT NULL COMMENT '互动类型：comment-评论，message-私信，vote-投票等',
    content TEXT COMMENT '互动内容',
    fan_nickname VARCHAR(100) COMMENT '粉丝昵称',
    reply_content TEXT COMMENT '回复内容',
    interaction_time DATETIME COMMENT '互动时间',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-删除',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_interaction_type (interaction_type),
    INDEX idx_interaction_time (interaction_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='粉丝互动表';

-- 1.9 变现方案表 (monetization_plans)
CREATE TABLE IF NOT EXISTS monetization_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_name VARCHAR(100) NOT NULL COMMENT '方案名称',
    plan_type VARCHAR(50) COMMENT '方案类型：free-免费引流，paid-付费包，custom-定制服务等',
    description TEXT COMMENT '方案描述',
    test_start_date DATE COMMENT '测试开始日期',
    test_end_date DATE COMMENT '测试结束日期',
    target_value INT COMMENT '预期效果',
    actual_value INT COMMENT '实际效果',
    status VARCHAR(20) DEFAULT 'testing' COMMENT '状态：testing-测试中，completed-已完成，cancelled-已取消',
    notes TEXT COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='变现方案表';

-- 1.10 主题规划表 (theme_planning)
CREATE TABLE IF NOT EXISTS theme_planning (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    theme_date DATE NOT NULL COMMENT '主题日期',
    theme_name VARCHAR(200) NOT NULL COMMENT '主题名称',
    theme_description TEXT COMMENT '主题描述',
    theme_type VARCHAR(50) COMMENT '主题类型',
    platforms VARCHAR(200) COMMENT '发布平台（逗号分隔）',
    is_completed TINYINT DEFAULT 0 COMMENT '是否完成：1-完成，0-未完成',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-删除',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_theme_date (theme_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='主题规划表';

-- ============================================
-- 2. 扩展现有表结构
-- ============================================

-- 2.1 扩展习惯表 (habits)
-- ALTER TABLE habits ADD COLUMN category_id INT COMMENT '任务分类ID';
-- ALTER TABLE habits ADD COLUMN target_value INT COMMENT '目标值';
-- ALTER TABLE habits ADD COLUMN actual_value INT COMMENT '实际值';
-- ALTER TABLE habits ADD COLUMN time_slot VARCHAR(50) COMMENT '时间段：morning-上午，afternoon-下午，evening-晚上等';
-- ALTER TABLE habits ADD COLUMN tags VARCHAR(500) COMMENT '标签（逗号分隔）';
-- ALTER TABLE habits ADD COLUMN priority TINYINT DEFAULT 2 COMMENT '优先级：1-高，2-中，3-低';
-- ALTER TABLE habits ADD COLUMN is_template TINYINT DEFAULT 0 COMMENT '是否模板：1-模板，0-非模板';
-- ALTER TABLE habits ADD COLUMN template_id INT COMMENT '模板ID';

-- 2.2 扩展打卡记录表 (check_in_records)
-- ALTER TABLE check_in_records ADD COLUMN completion_notes TEXT COMMENT '完成备注';
-- ALTER TABLE check_in_records ADD COLUMN satisfaction_score TINYINT COMMENT '满意度评分1-5';
-- ALTER TABLE check_in_records ADD COLUMN time_spent INT COMMENT '耗时（分钟）';
-- ALTER TABLE check_in_records ADD COLUMN completion_time DATETIME COMMENT '完成时间';

-- 2.3 扩展笔记表 (notes)
-- ALTER TABLE notes ADD COLUMN note_type VARCHAR(50) DEFAULT 'general' COMMENT '笔记类型：general-通用，material-素材，review-复盘等';
-- ALTER TABLE notes ADD COLUMN is_template TINYINT DEFAULT 0 COMMENT '是否模板：1-模板，0-非模板';
-- ALTER TABLE notes ADD COLUMN template_id INT COMMENT '模板ID';

-- ============================================
-- 3. 初始化数据
-- ============================================

-- 3.1 插入默认任务分类
-- INSERT INTO task_categories (user_id, name, icon, color, sort_order) VALUES
-- (0, '内容创作', 'content', '#FF6B6B', 1),
-- (0, '素材收集', 'collect', '#4ECDC4', 2),
-- (0, '互动管理', 'interaction', '#45B7D1', 3),
-- (0, '数据分析', 'analysis', '#96CEB4', 4),
-- (0, '其他', 'other', '#FFEAA7', 5)
-- ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3.2 插入默认素材分类
-- INSERT INTO material_categories (user_id, name, icon, color, sort_order) VALUES
-- (0, '灵感素材', 'lightbulb', '#FFD93D', 1),
-- (0, '金句收藏', 'quote', '#FF6B6B', 2),
-- (0, '关键词库', 'keyword', '#4ECDC4', 3),
-- (0, '参考图片', 'image', '#45B7D1', 4),
-- (0, '技巧笔记', 'tip', '#96CEB4', 5)
-- ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3.3 插入默认标签
-- INSERT INTO tags (user_id, name, color, tag_type) VALUES
-- (0, '治愈', '#FF6B6B', 'material'),
-- (0, '森林', '#4ECDC4', 'material'),
-- (0, '吉卜力', '#45B7D1', 'material'),
-- (0, '水彩', '#96CEB4', 'material'),
-- (0, '简约', '#FFEAA7', 'material')
-- ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ============================================
-- 4. 验证表创建
-- ============================================

-- 显示所有新增的表
SHOW TABLES LIKE 'task_categories';
SHOW TABLES LIKE 'material_categories';
SHOW TABLES LIKE 'materials';
SHOW TABLES LIKE 'tags';
SHOW TABLES LIKE 'social_platforms';
SHOW TABLES LIKE 'content_publish';
SHOW TABLES LIKE 'style_tests';
SHOW TABLES LIKE 'fan_interactions';
SHOW TABLES LIKE 'monetization_plans';
SHOW TABLES LIKE 'theme_planning';

-- 显示扩展的表结构
DESC habits;
DESC check_in_records;
DESC notes;

-- ============================================
-- 5. 完成
-- ============================================
SELECT '数据库迁移V2.0完成！' AS message;
