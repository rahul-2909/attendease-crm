const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  if (!env.MAIL_HOST || !env.MAIL_USER || !env.MAIL_PASSWORD || !env.MAIL_FROM) {
    const error = new Error('Email service is not configured');
    error.statusCode = 500;
    throw error;
  }

  transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: env.MAIL_SECURE,
    auth: {
      user: env.MAIL_USER,
      pass: env.MAIL_PASSWORD,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });

  return transporter;
};

const sendMail = async ({ to, subject, text, html }) => {
  const mailer = getTransporter();

  return mailer.sendMail({
    from: env.MAIL_FROM,
    to,
    subject,
    text,
    html,
  });
};

module.exports = {
  getTransporter,
  sendMail,
};
