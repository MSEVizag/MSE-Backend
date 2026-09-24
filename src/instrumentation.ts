import { configure, getConsoleSink } from '@logtape/logtape';
import { verifyDatabaseConnection } from './lib/db';

let initialized = false;

export async function register() {
    if (initialized) return;

    await configure({
        sinks: {
            console: getConsoleSink()
        },
        loggers: [
            {
                category: [],
                lowestLevel: 'debug',
                sinks: ['console']
            }
        ]
    });

    initialized = true;

    if (process.env.NODE_ENV === 'development') {
        await verifyDatabaseConnection();
    }
}
