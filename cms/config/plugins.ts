type Env = {
  (key: string, defaultValue?: unknown): string;
  int: (key: string, defaultValue?: number) => number;
  bool: (key: string, defaultValue?: boolean) => boolean;
};

export default ({ env }: { env: Env }) => ({
  i18n: true,
  'editorial-portal': {
    enabled: true,
    resolve: './src/plugins/editorial-portal',
  },
  email: {
    config: {
      provider: env('EMAIL_PROVIDER', 'nodemailer'),
      providerOptions: {
        host: env('SMTP_HOST', 'mailpit'),
        port: env.int('SMTP_PORT', 1025),
        secure: env.bool('SMTP_SECURE', false),
        requireTLS: env.bool('SMTP_REQUIRE_TLS', false),
        connectionTimeout: env.int('SMTP_CONNECTION_TIMEOUT_MS', 10000),
        greetingTimeout: env.int('SMTP_GREETING_TIMEOUT_MS', 10000),
        socketTimeout: env.int('SMTP_SOCKET_TIMEOUT_MS', 15000),
        tls: { minVersion: 'TLSv1.2', rejectUnauthorized: env.bool('SMTP_TLS_REJECT_UNAUTHORIZED', true) },
        ...(env('SMTP_USER', '') || env('SMTP_PASS', '') ? { auth: { user: env('SMTP_USER', ''), pass: env('SMTP_PASS', '') } } : {}),
      },
      settings: {
        defaultFrom: env('SMTP_FROM', 'portfolio-local@example.test'),
        defaultReplyTo: env('SMTP_FROM', 'portfolio-local@example.test'),
      },
    },
  },
  upload: {
    config: {
      provider: 'local',
      providerOptions: {},
      actionOptions: {
        upload: { sizeLimit: env('UPLOAD_MAX_SIZE', '12582912') },
        uploadStream: { sizeLimit: env('UPLOAD_MAX_SIZE', '12582912') },
        delete: {},
      },
    },
  },
});
