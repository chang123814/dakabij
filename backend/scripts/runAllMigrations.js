const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runAllMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    console.log('数据库连接成功\n');

    const migrations = [
      { name: 'database_init.sql', path: path.join(__dirname, '..', '..', 'database_init.sql') },
      { name: 'database_migration_v2.sql', path: path.join(__dirname, '..', '..', 'database_migration_v2.sql') }
    ];

    for (const migration of migrations) {
      console.log(`开始执行 ${migration.name}...`);
      
      if (!fs.existsSync(migration.path)) {
        console.error(`❌ 文件不存在: ${migration.path}`);
        continue;
      }

      const sql = fs.readFileSync(migration.path, 'utf8');
      await connection.query(sql);
      console.log(`✅ ${migration.name} 执行成功\n`);
    }

    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n当前数据库表列表：');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    console.log('\n✅ 所有数据库迁移执行完成！');

  } catch (error) {
    console.error('❌ 数据库迁移失败：', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

runAllMigrations().catch(console.error);