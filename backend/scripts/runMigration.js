const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    console.log('数据库连接成功');
    console.log('开始执行数据库迁移...');

    const sqlPath = path.join(__dirname, '..', '..', 'database_migration_v2.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await connection.query(sql);
    console.log('✅ 数据库迁移执行成功！');
    
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n当前数据库表列表：');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

  } catch (error) {
    console.error('❌ 数据库迁移失败：', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration().catch(console.error);