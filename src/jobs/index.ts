import { processAutosaving } from '../services/savings.service';

import * as cron from 'node-cron';

const registerJobs = () => {
  cron.schedule('0 8 * * *', async () => {
    await processAutosaving('daily');
  });
  cron.schedule('0 8 * * *', async () => {
    await processAutosaving('weekly');
  });
  cron.schedule('0 8 * * *', async () => {
    await processAutosaving('monthly');
  });
  cron.schedule('* * * * *', () => {
    console.log('running a task every minute');
  });
};

export default registerJobs;
