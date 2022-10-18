import Queue from 'bull';
import Redis from 'ioredis';
import config from '.';

import emailProcessor from '../Processors/email';
import flwProcessorWebhook from '../Processors/flw_webhook';
import paymentChargeProcessor from '../Processors/paymentCharge';

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

// https://lifesaver.codes/answer/empty-and-clean-jobs // Empty queue
