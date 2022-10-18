import { processWebHook } from '../../services/webhook.service';

const flwProcessorWebhook = async (job: any, done: any) => {
  try {
    console.log('flwWebHookQueue', 'handling data');
    await processWebHook({
      ...job.data,
    });
    done();
  } catch (e) {
    console.log(e.message);
    done(new Error(`Flw webhook processing failed`));
  }
};

export default flwProcessorWebhook;
