// frontend/src/utils/logger.js
// Thin structured frontend logger.
// In dev: uses console. In prod: batches errors to /api/client-error via sendBeacon.

const isProd = import.meta.env.PROD;
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const baseContext = () => ({
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
});

const beacon = (payload) => {
    try {
        navigator.sendBeacon(
            `${API}/client-error`,
            new Blob([JSON.stringify(payload)], { type: 'application/json' })
        );
    } catch {
        // sendBeacon not available — silently drop
    }
};

const logger = {
    info(message, meta = {}) {
        if (!isProd) console.info(`[INFO] ${message}`, meta);
    },

    warn(message, meta = {}) {
        if (!isProd) console.warn(`[WARN] ${message}`, meta);
        // warnings not sent to backend — too noisy
    },

    error(message, meta = {}) {
        console.error(`[ERROR] ${message}`, meta);
        if (isProd) {
            beacon({ message, ...meta, ...baseContext() });
        }
    },

    // Called by ErrorBoundary with a caught React error
    captureException(error, errorInfo = {}) {
        const payload = {
            message: error?.message ?? String(error),
            source: 'ErrorBoundary',
            stack: error?.stack?.slice(0, 1500),
            componentStack: errorInfo?.componentStack?.slice(0, 1000),
            ...baseContext(),
        };
        console.error('[EXCEPTION]', payload);
        if (isProd) beacon(payload);
    },
};

export default logger;
