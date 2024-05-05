const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create transporter [it's standered what ever the service]
  const transporter = await nodemailer.createTransport({
    secureProtocol: 'TLSv1_2_method',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    secure: false,
    logger: true,
    tls: {
      rejectUnauthorized: true,
    },
    // Active in gmail "app less secure" option
  });

  // 2) Define the email options
  const mail0ptions = {
    from: 'Mohamed Zakaria <sheno@mail.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Actually send the email
  await transporter.sendMail(mail0ptions);
};

module.exports = sendEmail;
