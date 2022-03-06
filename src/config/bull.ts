import Queue from 'bull'
import Redis from 'ioredis'
import config from '.'
const { url } = config.redis

import { emailQueueHandler } from '../services/email';
import { flwWebHookQueueHandler } from '../services/webhook.service';

// https://github.com/OptimalBits/bull/blob/master/PATTERNS.md#reusing-redis-connections

const client = new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
});
const subscriber = new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
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
                    enableReadyCheck: false
                });
        }
    }
}

client.on('ready', () => {
    console.log('client ready')
})

export const emailQueue = new Queue('sendEmail', opts)
export const flwWebHookQueue = new Queue('Flw_webHook', opts)

export const testQueue = new Queue('test', opts)

emailQueue.process(emailQueueHandler);
flwWebHookQueue.process(flwWebHookQueueHandler);





testQueue.process(function (job, done) {
    console.log("Re", job.data.msg);
    done();
});;


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


