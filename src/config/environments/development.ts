export default {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || '*'
    }
  },
  database: {
    url: process.env.DATABASE_URL
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  },
  logging: {
    level: 'debug',
    file: {
      enabled: true,
      path: 'logs'
    }
  },
  rateLimiter: {
    enabled: false
  }
};