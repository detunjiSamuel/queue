import app from './app'
import config from './config'

import startDb from './config/database'

require('./config/bull')

startDb()

app.listen(config.port, async () => {
  console.log(`🚀 app running on port  ${config.port}`)

})
