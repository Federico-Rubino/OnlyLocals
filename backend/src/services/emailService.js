const nodemailer = require('nodemailer');

let _transporter = null;
const getTransporter = () => {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return _transporter;
};

exports.sendPasswordRecoveryPin = async (toEmail, pin) => {
  await getTransporter().sendMail({
    from: `"OnlyLocals" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'OnlyLocals – Password Recovery',
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: auto;">
        <h2>Password Recovery</h2>
        <p>Use the following code to reset your password. It expires in <strong>15 minutes</strong>.</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center;
                    padding: 20px; background: #f4f4f4; border-radius: 8px; margin: 24px 0;">
          ${pin}
        </div>
        <p style="color: #888; font-size: 12px;">
          If you did not request this, ignore this email. Your password will not change.
        </p>
      </div>
    `,
  });
};
