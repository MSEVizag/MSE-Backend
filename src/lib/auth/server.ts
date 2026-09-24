import { getLogger } from '@logtape/logtape';
import { createNeonAuth } from '@neondatabase/auth/next/server';

const logger = getLogger(['ms-engineering-logs', 'neon-auth-log']);

export const auth = createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL!,
    cookies: {
        secret: process.env.NEON_AUTH_COOKIE_SECRET!
    },
    logLevel: 'debug',
    logger: {
        warn(message, meta) {
            logger.warn({ message, ...meta });
        },
        info(message, meta) {
            logger.info({ message, ...meta });
        },
        error(message, meta) {
            logger.error({ message, ...meta });
        }
    }
})