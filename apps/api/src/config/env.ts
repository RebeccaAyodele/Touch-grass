import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.string().default('4000').transform(Number),
  WEB_ORIGIN: z.string().default('http://localhost:3000'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/touch_grass'),
  MONGODB_DATABASE: z.string().default('touch_grass'),
  JWT_SECRET: z.string().min(16).default('development_secret_key_at_least_32_chars_long'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  AI_PROVIDER: z.string().default('mock'),
  AI_BASE_URL: z.string().optional(),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default('gemma-2-9b-it'),
  AI_REQUEST_TIMEOUT_MS: z.string().default('30000').transform(Number),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  LOG_LEVEL: z.string().default('info'),
});

export const env = EnvSchema.parse(process.env);
