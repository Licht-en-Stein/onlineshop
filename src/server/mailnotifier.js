const nodemailer = require('nodemailer');

function sendMail(recipientAddress, subject, body) {

const smtpConfig = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: // 'email',
    pass: // 'pwd'
  }
};

const transporter = nodemailer.createTransport(smtpConfig);
const mailOptions = {
  from: // '"email',
  to: recipientAddress,
  subject: subject,
  text: body,
  html: body
};

transporter.sendMail(mailOptions, (err, info) => {
  if(err)
    console.log('mail was not delivered');
})
}

module.exports.sendMail = sendMail

