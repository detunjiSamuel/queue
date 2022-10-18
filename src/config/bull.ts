import Queue from 'bull';
import Redis from 'ioredis';
import config from '.';

import emailProcessor from '../jobs/processors/email';
import flwProcessorWebhook from '../jobs/processors/flw_webhook';
import paymentChargeProcessor from '../jobs/processors/paymentCharge';

// https://github.com/OptimalBits/bull/issues/503#issuecomment-338212399
const EventEmitter = require('events');
EventEmitter.defaultMaxListeners = Infinity;

const { url } = config.redis;

// https://github.com/OptimalBits/bull/blob/master/PATTERNS.md#reusing-redis-connections

const client = new Redis(url, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
const subscriber = new Redis(url, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const opts = {
  createClient: function (type) {
    switch (type) {
      case 'client':
        return client;
      case 'subscriber':
        return subscriber;
      default:
        return new Redis(url, {
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        });
    }
  },
};

client.on('ready', () => {
  console.log('client ready');
});

export const emailQueue = new Queue('sendEmail', opts);
export const flwWebHookQueue = new Queue('Flw_webHook', opts);
export const chargeQueue = new Queue('charge_card', opts);

emailQueue.process(5, emailProcessor);
flwWebHookQueue.process(5, flwProcessorWebhook);
chargeQueue.process(5, paymentChargeProcessor);

export const dailyCronQueue = new Queue('dcron', opts);
export const weeklyCronQueue = new Queue('wcron', opts);
export const monthlyCronQueue = new Queue('mcron', opts);

require('../jobs/index');

export const testQueue = new Queue('test', opts);

testQueue.process(function (job, done) {
  console.log('Re', job.data.msg);
  done();
});

// testQueue.add({ msg: 'bar' })

// https://lifesaver.codes/answer/empty-and-clean-jobs
// Empty queue

// emailQueue.clean(0, 'delayed');
// emailQueue.clean(0, 'wait');
// emailQueue.clean(0, 'active');
// emailQueue.clean(0, 'completed');
// emailQueue.clean(0, 'failed');

// let multi = emailQueue.multi();
// multi.del(emailQueue.toKey('repeat'));
// multi.exec();

// const payload  = {
//     to  : "samadetunji01@gmail.com",
//     subject : "test-failure",
//     html : "<div>test</div>"
// }

// emailQueue.add({payload})
