import { chargeWithToken } from '../services/flutterwave.service';

const paymentChargeProcessor = async (job, done) => {
  const { payload } = job.data;

  try {
    console.log('chargeQueue', 'sending payload');
    await chargeWithToken(payload);
    done();
  } catch (e) {
    done(new Error(`send mail failed- ${payload.subject}`));
  }
};

export default paymentChargeProcessor;
