const getAdminEmails = () =>
  (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const isAdminEmail = (email) => {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
};

const adminMiddleware = (req, res, next) => {
  if (!req.user?.email || !isAdminEmail(req.user.email)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

export default adminMiddleware;
