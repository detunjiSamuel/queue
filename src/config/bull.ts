import Queue from 'bull';
import Redis from 'ioredis';
import config from '.';

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

interface queueMap {
  // eslint-disable-next-line no-use-before-define
  [queueName: string]: queue;
}

const queues: queueMap = {};

export default class queue extends Queue {
  constructor(name) {
    super(name, opts);
    queues[name] = this;
  }
}

export const getQueue = (queueName) => {
  const queue = queues[queueName];
  if (!queue) throw new Error('Invalid Queue name passed');
  return queue;
};

export const getQueues = () => {
  return Object.values(queues);
};

// https://lifesaver.codes/answer/empty-and-clean-jobs // Empty queue
