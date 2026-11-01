const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const accountCredentialsEmail = ({ name, email, password, loginUrl }) => {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePassword = escapeHtml(password);
  const safeLoginUrl = loginUrl ? escapeHtml(loginUrl) : null;

  const subject = 'Your account has been created';

  const textLines = [
    `Hi ${name},`,
    '',
    'An account has been created for you.',
    '',
    `Email: ${email}`,
    `Password: ${password}`,
    '',
    'Please sign in and change your password as soon as possible.',
  ];

  if (loginUrl) {
    textLines.push('', `Sign in: ${loginUrl}`);
  }

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="margin-bottom: 8px;">Your account has been created</h2>
      <p>Hi ${safeName},</p>
      <p>An account has been created for you. Use the credentials below to sign in.</p>
      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 6px 12px 6px 0; font-weight: bold;">Email</td>
          <td style="padding: 6px 0;">${safeEmail}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px 6px 0; font-weight: bold;">Password</td>
          <td style="padding: 6px 0;">${safePassword}</td>
        </tr>
      </table>
      <p>Please sign in and change your password as soon as possible.</p>
      ${
        safeLoginUrl
          ? `<p><a href="${safeLoginUrl}" style="color: #2563eb;">Sign in to your account</a></p>`
          : ''
      }
    </div>
  `.trim();

  return {
    subject,
    text: textLines.join('\n'),
    html,
  };
};

module.exports = {
  accountCredentialsEmail,
};
