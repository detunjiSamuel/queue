import app from './app'
import config from './config'

import startDb from './config/database'





app.listen(config.port, async () => {
  console.log(`🚀 app running on port  ${config.port}`)
  // setup queues
  require('./config/bull')

  startDb()
})
