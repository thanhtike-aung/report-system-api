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
    level: 'info',
    file: {
      enabled: true,
      path: '/var/log/report-system'
    }
  },
  rateLimiter: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
  }
};