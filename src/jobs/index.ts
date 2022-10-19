import { processAutosaving } from '../services/savings.service';

import * as cron from 'node-cron';

const registerJobs = () => {
  cron.schedule('0 8 * * *', async () => {
    await processAutosaving('daily');
  });
  cron.schedule('0 0 * * 0', async () => {
    await processAutosaving('weekly');
  });
  cron.schedule('0 0 1 * *', async () => {
    await processAutosaving('monthly');
  });
};

export default registerJobs;
