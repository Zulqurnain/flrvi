/**
 * @file Middleware to check if the authenticated user is an admin.
 * @module middleware/admin
 */

/**
 * Middleware to verify if the authenticated user has admin privileges.
 * It expects `req.user` to be populated by a preceding authentication middleware.
 * If the user is not authenticated or does not have `isAdmin: true`, it sends a 403 Forbidden response.
 * Otherwise, it calls the next middleware in the stack.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
const admin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Not authorized as an admin' });
  }
  next();
};

module.exports = { admin };
