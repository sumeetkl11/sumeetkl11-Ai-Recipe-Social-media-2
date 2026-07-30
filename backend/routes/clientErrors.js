// backend/routes/clientErrors.js
// Receives client-side error reports from the frontend ErrorBoundary + logger
import { Router } from 'express';
import { generalLimiter } from '../middleware/rateLimiter.js';
import logger from '../utils/logger.js';

const router = Router();

// Rate-limited: max 20 client-error reports per 15 min per IP
router.post('/', generalLimiter, (req, res) => {
    const { message, source, stack, url, userAgent, timestamp } = req.body;

    // Validate minimally — reject empty reports
    if (!message && !source) {
        return res.status(400).json({ success: false, message: 'No error data provided' });
    }

    logger.error('Client-side error reported', {
        message,
        source,
        stack: stack?.slice(0, 1000), // cap stack length
        url,
        userAgent,
        clientTimestamp: timestamp,
        userId: req.user?.id ?? null,
    });

    res.status(204).end();
});

export default router;
