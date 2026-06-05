const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const FROM_NAME    = 'OnlyLocals';
const FROM_EMAIL   = process.env.BREVO_SENDER_EMAIL;

exports.sendPasswordRecoveryPin = async (toEmail, pin) => {
  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key':      process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender:      { name: FROM_NAME, email: FROM_EMAIL },
      to:          [{ email: toEmail }],
      subject:     'OnlyLocals – Codice di recupero password',
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 400px; margin: auto;">
          <h2>Recupero password</h2>
          <p>Usa il seguente codice per reimpostare la tua password.
             Scade tra <strong>15 minuti</strong>.</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px;
                      text-align: center; padding: 20px; background: #f4f4f4;
                      border-radius: 8px; margin: 24px 0;">
            ${pin}
          </div>
          <p style="color: #888; font-size: 12px;">
            Se non hai richiesto questa operazione, ignora questa email.
          </p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo error ${res.status}: ${body}`);
  }
};
