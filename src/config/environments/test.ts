export default {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    cors: {
      origin: '*'
    }
  },
  database: {
    url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
  },
  jwt: {
    secret: 'test-secret',
    expiresIn: '1h'
  },
  logging: {
    level: 'error',
    file: {
      enabled: false
    }
  },
  rateLimiter: {
    enabled: false
  }
};