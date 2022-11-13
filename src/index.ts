import app from './app';
import config from './config';

import startDb from './config/database';
import registerJobs from './start/jobs';

app.listen(config.port, async () => {
  console.log(`🚀 app running on port  ${config.port}`);
  startDb();
  registerJobs();
});
