import nodemailer from 'nodemailer';

const asBoolean = (value, fallback) => value === undefined || value === '' ? fallback : value === 'true' || value === '1';
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function smtpOptionsFromEnv(env = process.env) {
  const provider = env.SMTP_PROVIDER || 'mailpit';
  const port = Number(env.SMTP_PORT || 1025);
  const secure = asBoolean(env.SMTP_SECURE, port === 465);
  const requireTLS = asBoolean(env.SMTP_REQUIRE_TLS, port === 587 && !secure);
  const tlsRejectUnauthorized = asBoolean(env.SMTP_TLS_REJECT_UNAUTHORIZED, true);
  const options = {
    host: env.SMTP_HOST || '127.0.0.1',
    port,
    secure,
    requireTLS,
    connectionTimeout: Number(env.SMTP_CONNECTION_TIMEOUT_MS || 10000),
    greetingTimeout: Number(env.SMTP_GREETING_TIMEOUT_MS || 10000),
    socketTimeout: Number(env.SMTP_SOCKET_TIMEOUT_MS || 15000),
    tls: { minVersion: 'TLSv1.2', rejectUnauthorized: tlsRejectUnauthorized },
  };
  if (env.SMTP_USER || env.SMTP_PASS) options.auth = { user: env.SMTP_USER, pass: env.SMTP_PASS };
  return { provider, options };
}

export function validateSmtpConfig(env = process.env) {
  const { provider, options } = smtpOptionsFromEnv(env);
  const required = ['SMTP_FROM', 'CONTACT_TO'];
  if (required.some((key) => !env[key])) return { ok: false, code: 'mail_not_configured' };
  if (!Number.isInteger(options.port) || options.port < 1 || options.port > 65535) return { ok: false, code: 'mail_configuration_invalid' };
  if (provider !== 'mailpit' && (!env.SMTP_USER || !env.SMTP_PASS)) return { ok: false, code: 'mail_not_configured' };
  if (provider !== 'mailpit' && options.port === 465 && !options.secure) return { ok: false, code: 'mail_configuration_invalid' };
  if (provider !== 'mailpit' && options.port === 587 && (!options.requireTLS || options.secure)) return { ok: false, code: 'mail_configuration_invalid' };
  if (provider !== 'mailpit' && !options.tls.rejectUnauthorized) return { ok: false, code: 'mail_configuration_invalid' };
  return { ok: true, provider, options };
}

export async function sendContactMessage({ name, email, subject, message, language }, env = process.env) {
  const config = validateSmtpConfig(env);
  if (!config.ok) return config;
  const transport = nodemailer.createTransport(config.options);
  try {
    await transport.sendMail({
      from: env.SMTP_FROM,
      to: env.CONTACT_TO,
      replyTo: { name, address: email },
      subject: `[Portfolio Brice Miaffo] ${subject}`,
      text: `Langue: ${language}\nNom: ${name}\nCourriel: ${email}\nObjet: ${subject}\n\n${message}`,
      html: `<p><strong>Langue:</strong> ${escapeHtml(language)}</p><p><strong>Nom:</strong> ${escapeHtml(name)}</p><p><strong>Courriel:</strong> ${escapeHtml(email)}</p><p><strong>Objet:</strong> ${escapeHtml(subject)}</p><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    return { ok: true };
  } finally {
    transport.close();
  }
}
