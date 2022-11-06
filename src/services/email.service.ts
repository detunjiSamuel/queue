import * as nodemailer from 'nodemailer';
import config from '../config';

const { mail } = config;

// https://ethereal.email/

interface mailContent {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  host: mail.host,
  port: Number(mail.port),
  secure: false,
  auth: {
    user: mail.auth.user,
    pass: mail.auth.pass,
  },
});

// { ...mail }

export const sendEmail = async (payload: mailContent) => {
  try {
    console.log('send mail', 'final send');

    const newMail = await transporter.sendMail(payload);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(newMail));
  } catch (e) {
    console.log('Error occurred. ' + e.message);
    throw e;
  }
};
