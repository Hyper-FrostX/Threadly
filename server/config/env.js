import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config()

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  databasePath: path.resolve(process.env.DATABASE_PATH || './data/threadly.sqlite'),
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
}

if (env.nodeEnv === 'production' && env.jwtSecret.length < 32) {
  throw new Error('Set JWT_SECRET to a unique value of at least 32 characters in production.')
}
