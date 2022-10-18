import config from '../config';
import { sendEmail } from '../services/email.service';

const { mail } = config;
const emailProcessor = async (job, done) => {
  const { payload } = job.data;
  payload.from = mail.auth.user;
  try {
    console.log('emailQueue', 'sending payload');
    await sendEmail(payload);
    done();
  } catch (e) {
    done(new Error(`send mail failed- ${payload.subject}`));
  }
};

export default emailProcessor;
