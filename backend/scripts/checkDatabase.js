const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('数据库连接成功\n');
    
    const [tables] = await connection.query('SHOW TABLES');
    console.log('当前数据库表列表：');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    if (tables.length > 0) {
      console.log('\n检查 users 表结构：');
      const [usersColumns] = await connection.query('DESCRIBE users');
      usersColumns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
      });
    }

  } catch (error) {
    console.error('错误：', error.message);
  } finally {
    await connection.end();
  }
}

checkDatabase();