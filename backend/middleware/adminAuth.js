/**
 * Enhanced Admin Authentication Middleware for FLRVI
 * Supports the new admin_users collection with role-based permissions
 */

const jwt = require('jsonwebtoken');
const { getPb } = require('../db/pocketbase');

/**
 * Authenticate admin user and check permissions
 * @param {Array} requiredPermissions - Array of required permissions
 * @returns {Function} Express middleware function
 */
const adminAuth = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '') || 
                    req.header('admin-token') ||
                    req.cookies?.adminToken;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No admin token provided'
        });
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const pb = getPb();

      // Get admin user from database
      const adminUser = await pb.collection('admin_users').getOne(decoded.id, {
        fields: 'id,username,email,role,permissions,is_active,last_login'
      });

      // Check if admin is active
      if (!adminUser.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Admin account is deactivated'
        });
      }

      // Check if user has required permissions
      if (requiredPermissions.length > 0) {
        const userPermissions = adminUser.permissions || [];
        const hasPermission = requiredPermissions.every(permission => 
          userPermissions.includes(permission) || 
          userPermissions.includes('system_control') || 
          adminUser.role === 'super_admin'
        );

        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            message: `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
            userPermissions,
            requiredPermissions
          });
        }
      }

      // Update last login
      try {
        await pb.collection('admin_users').update(adminUser.id, {
          last_login: new Date().toISOString()
        });
      } catch (error) {
        console.warn('Failed to update admin last login:', error.message);
      }

      // Attach admin user to request
      req.adminUser = adminUser;
      req.isAdmin = true;
      
      next();

    } catch (error) {
      console.error('Admin auth error:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid admin token'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Admin token expired'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Admin authentication failed'
      });
    }
  };
};

/**
 * Check if user has specific role
 * @param {Array} allowedRoles - Array of allowed roles
 * @returns {Function} Express middleware function
 */
const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.adminUser) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    if (!allowedRoles.includes(req.adminUser.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        currentRole: req.adminUser.role
      });
    }

    next();
  };
};

/**
 * Login admin user
 */
const loginAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if ((!username && !email) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/email and password are required'
      });
    }

    const pb = getPb();
    
    // Authenticate with PocketBase
    const authData = await pb.collection('admin_users').authWithPassword(
      username || email,
      password
    );

    if (!authData.record.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Admin account is deactivated'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: authData.record.id,
        username: authData.record.username,
        role: authData.record.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    await pb.collection('admin_users').update(authData.record.id, {
      last_login: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Admin login successful',
      admin: {
        id: authData.record.id,
        username: authData.record.username,
        email: authData.record.email,
        role: authData.record.role,
        permissions: authData.record.permissions || []
      },
      token,
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Admin login error:', error);
    
    if (error.status === 400) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

/**
 * Get current admin profile
 */
const getProfile = async (req, res) => {
  try {
    if (!req.adminUser) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    res.json({
      success: true,
      admin: {
        id: req.adminUser.id,
        username: req.adminUser.username,
        email: req.adminUser.email,
        role: req.adminUser.role,
        permissions: req.adminUser.permissions || [],
        last_login: req.adminUser.last_login,
        created: req.adminUser.created
      }
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin profile'
    });
  }
};

/**
 * Change admin password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password, new password, and confirmation are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    const pb = getPb();
    
    // Verify current password by attempting authentication
    try {
      await pb.collection('admin_users').authWithPassword(
        req.adminUser.username,
        currentPassword
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await pb.collection('admin_users').update(req.adminUser.id, {
      password: newPassword,
      passwordConfirm: newPassword
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Permission constants for easy reference
const PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_THEMES: 'manage_themes',
  MANAGE_PAYMENTS: 'manage_payments',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_CONTENT: 'manage_content',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_LOGS: 'view_logs',
  MANAGE_ADMINS: 'manage_admins',
  DELETE_USERS: 'delete_users',
  SYSTEM_CONTROL: 'system_control'
};

const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
};

module.exports = {
  adminAuth,
  requireRole,
  loginAdmin,
  getProfile,
  changePassword,
  PERMISSIONS,
  ROLES
};