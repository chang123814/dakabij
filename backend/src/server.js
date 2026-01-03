const { loadEnv } = require('./config/env')

loadEnv()

const createApp = require('./app')
const { testConnection } = require('./config/database')

const PORT = process.env.SERVER_PORT || 3000
const HOST = process.env.SERVER_HOST || '0.0.0.0'


async function bootstrap () {
  try {
    await testConnection()
    const app = createApp()

    app.listen(PORT, HOST, () => {
      console.log(`Server is running at http://${HOST}:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to initialize server:', error)
    process.exit(1)
  }
}

bootstrap()
