const nodemailer = require('nodemailer');

function sendMail(recipientAddress, subject, body) {

  // email smtpcrimson@gmail.com
// password

const smtpConfig = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'smtpcrimson@gmail.com',
    pass: 'nOOOpooo'
  }
};

const transporter = nodemailer.createTransport(smtpConfig);
const mailOptions = {
  from: '"Crimson Lavender" <smtpcrimson@gmail.com>',
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

