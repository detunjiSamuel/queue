import Queue from '../config/bull';

import emailProcessor from '../processors/email';
import flwProcessorWebhook from '../processors/flw_webhook';
import paymentChargeProcessor from '../processors/paymentCharge';

const registerQueues = () => {
  const emailQueue = new Queue('sendEmail');
  const flwWebHookQueue = new Queue('Flw_webHook');
  const chargeQueue = new Queue('charge_card');

  emailQueue.process(5, emailProcessor);
  flwWebHookQueue.process(5, flwProcessorWebhook);
  chargeQueue.process(5, paymentChargeProcessor);

  console.log('🚀 Queues up and running 🚀 🚀 🚀');
};

export default registerQueues;
