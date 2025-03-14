export const jwt = {
  secret: process.env.APP_SECRET || 'default',
  signOptions: { expiresIn: '14d' },
};
