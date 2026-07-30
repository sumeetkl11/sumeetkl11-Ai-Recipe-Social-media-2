/**
 * Socket.io Dependency Injection Middleware
 * Injects the Socket.io instance into the request object
 * This replaces the global.io anti-pattern
 */
export const socketInjector = (req, res, next) => {
    req.io = req.app.get('io');
    next();
};
