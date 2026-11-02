import test from 'node:test';
import assert from 'node:assert/strict';
import { smtpOptionsFromEnv, validateSmtpConfig } from '../server/mail.mjs';

const base = {
  SMTP_FROM: 'portfolio-local@example.test',
  CONTACT_TO: 'qa-inbox@example.test',
};

test('SMTP local Mailpit defaults are explicit and non-TLS', () => {
  const { provider, options } = smtpOptionsFromEnv(base);
  assert.equal(provider, 'mailpit');
  assert.equal(options.host, '127.0.0.1');
  assert.equal(options.port, 1025);
  assert.equal(options.secure, false);
  assert.equal(options.tls.rejectUnauthorized, true);
  assert.equal(validateSmtpConfig(base).ok, true);
});

test('Hostinger 465 requires implicit TLS and credentials', () => {
  const env = { ...base, SMTP_PROVIDER: 'hostinger-email', SMTP_HOST: 'smtp.hostinger.com', SMTP_PORT: '465', SMTP_SECURE: 'true', SMTP_USER: 'mail@example.com', SMTP_PASS: 'local-only' };
  const config = validateSmtpConfig(env);
  assert.equal(config.ok, true);
  assert.equal(config.options.secure, true);
});

test('Hostinger 587 requires STARTTLS and rejects insecure TLS', () => {
  const valid = { ...base, SMTP_PROVIDER: 'titan', SMTP_HOST: 'smtp.titan.email', SMTP_PORT: '587', SMTP_SECURE: 'false', SMTP_REQUIRE_TLS: 'true', SMTP_USER: 'mail@example.com', SMTP_PASS: 'local-only' };
  assert.equal(validateSmtpConfig(valid).ok, true);
  assert.equal(validateSmtpConfig({ ...valid, SMTP_REQUIRE_TLS: 'false' }).code, 'mail_configuration_invalid');
  assert.equal(validateSmtpConfig({ ...valid, SMTP_TLS_REJECT_UNAUTHORIZED: 'false' }).code, 'mail_configuration_invalid');
});

test('missing production credentials is never treated as configured', () => {
  const env = { ...base, SMTP_PROVIDER: 'hostinger-email', SMTP_HOST: 'smtp.hostinger.com', SMTP_PORT: '465', SMTP_SECURE: 'true' };
  assert.equal(validateSmtpConfig(env).code, 'mail_not_configured');
});
