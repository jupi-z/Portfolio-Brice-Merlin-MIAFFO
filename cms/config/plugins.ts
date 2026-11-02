export default ({ env }: { env: (key: string, defaultValue?: unknown) => string }) => ({
  upload: {
    config: {
      provider: 'local',
      providerOptions: {},
      actionOptions: {
        upload: { sizeLimit: env('UPLOAD_MAX_SIZE', '10485760') },
        uploadStream: { sizeLimit: env('UPLOAD_MAX_SIZE', '10485760') },
        delete: {},
      },
    },
  },
});
