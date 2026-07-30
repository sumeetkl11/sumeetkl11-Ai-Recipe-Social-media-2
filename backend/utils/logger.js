// backend/utils/logger.js
// Structured logger — JSON in production, pretty in dev

const isProd = process.env.NODE_ENV === 'production';

const level = (lvl, data) => {
    const entry = {
        level: lvl,
        timestamp: new Date().toISOString(),
        ...data,
    };
    if (isProd) {
        process.stdout.write(JSON.stringify(entry) + '\n');
    } else {
        const { level: l, timestamp, message, ...rest } = entry;
        const prefix = { info: '\x1b[36mINFO\x1b[0m', warn: '\x1b[33mWARN\x1b[0m', error: '\x1b[31mERROR\x1b[0m' }[l] ?? l;
        console.log(`[${prefix}] ${timestamp.slice(11, 19)} ${message ?? ''}`, Object.keys(rest).length ? rest : '');
    }
};

const logger = {
    info:  (message, meta = {}) => level('info',  { message, ...meta }),
    warn:  (message, meta = {}) => level('warn',  { message, ...meta }),
    error: (message, meta = {}) => level('error', { message, ...meta }),
};

export default logger;
