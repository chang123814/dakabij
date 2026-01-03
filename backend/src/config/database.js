const { Sequelize } = require('sequelize')

const getDatabaseConfig = () => ({
  database: process.env.DB_NAME || 'habit_diary',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306
})

const createSequelizeInstance = () => {
  const { database, username, password, host, port } = getDatabaseConfig()

  return new Sequelize(database, username, password, {
    host,
    port,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      underscored: true,
      freezeTableName: false
    }
  })
}

const sequelize = createSequelizeInstance()

async function testConnection () {
  try {
    await sequelize.authenticate()
    console.log('[database] Connection established successfully')
  } catch (error) {
    console.error('[database] Unable to connect to the database:', error.message)
    throw error
  }
}

module.exports = {
  sequelize,
  testConnection
}
