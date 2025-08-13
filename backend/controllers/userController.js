const jwt = require('jsonwebtoken');
const { getPb } = require('../db/pocketbase');
const { validationResult } = require('express-validator');

// @desc    Register a new user
// @route   POST /api/v1/users/register
// @access  Public
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validation
    if (!name) {
      return res.status(400).json({ msg: 'Name is required' });
    }
    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }
    if (!password) {
      return res.status(400).json({ msg: 'Password is required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: 'Invalid email format' });
    }

    // Password length validation
    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }

    // Check if user exists in PocketBase
    try {
      const existingUser = await getPb().collection('users').getFirstListItem(`email="${email}"`);
      if (existingUser) {
        return res.status(400).json({ msg: 'User already exists' });
      }
    } catch (err) {
      // Not found (404) is okay, continue. Other errors should be thrown.
      if (err.status !== 404) {
        console.error('Error checking for existing user:', err.message);
        return res.status(500).json({ msg: 'Server error during user check' });
      }
    }

    // Create user in PocketBase
    const userData = {
      name,
      email,
      password,
      passwordConfirm: password,
      emailVisibility: true,
    };
    
    const record = await getPb().collection('users').create(userData);

    // Create JWT
    const token = jwt.sign({ id: record.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    });

    res.status(201).json({ token });
  } catch (err) {
    console.error('Error registering user:', err.message);
    // PocketBase specific error for duplicate email on create
    if (err.status === 400 && err.response && err.response.data && err.response.data.email) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }
    res.status(500).json({ msg: 'Server error during registration' });
  }
};

// @desc    Update user notification settings
// @route   PUT /api/v1/users/settings/notifications
// @access  Private
exports.updateNotificationSettings = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { newMessages, newLikes, appUpdates } = req.body;
  const userId = req.user.id;

  try {
    // Update notification settings in PocketBase
    const updatedUser = await getPb().collection('users').update(userId, {
      notificationSettings: {
        newMessages: newMessages,
        newLikes: newLikes,
        appUpdates: appUpdates
      }
    });

    res.json({
      msg: 'Notification settings updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Error updating notification settings:', err.message);
    res.status(500).json({ msg: 'Server error updating notification settings' });
  }
};

// @desc    Update user language preference
// @route   PUT /api/v1/users/settings/language
// @access  Private
exports.updateLanguage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { language } = req.body;
  const userId = req.user.id;

  try {
    // Update language preference in PocketBase
    const updatedUser = await getPb().collection('users').update(userId, {
      language: language
    });

    res.json({
      msg: 'Language updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Error updating language:', err.message);
    res.status(500).json({ msg: 'Server error updating language' });
  }
};

// @desc    Get list of blocked users
// @route   GET /api/v1/users/blocked
// @access  Private
exports.getBlockedUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get blocked users from PocketBase
    const blockedUsers = await getPb().collection('blocked_users').getFullList({
      filter: `blocker="${userId}"`,
      expand: 'blocked_user'
    });

    res.json(blockedUsers);
  } catch (err) {
    console.error('Error fetching blocked users:', err.message);
    res.status(500).json({ msg: 'Server error fetching blocked users' });
  }
};

// @desc    Block a user
// @route   POST /api/v1/users/block
// @access  Private
exports.blockUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId: blockedUserId } = req.body;
  const blockerId = req.user.id;

  try {
    // Check if already blocked
    const existingBlock = await getPb().collection('blocked_users').getFirstListItem(
      `blocker="${blockerId}" && blocked_user="${blockedUserId}"`
    ).catch(() => null);

    if (existingBlock) {
      return res.status(400).json({ msg: 'User already blocked' });
    }

    // Create block record in PocketBase
    const blockRecord = await getPb().collection('blocked_users').create({
      blocker: blockerId,
      blocked_user: blockedUserId,
      created: new Date()
    });

    res.json({
      msg: 'User blocked successfully',
      block: blockRecord
    });
  } catch (err) {
    console.error('Error blocking user:', err.message);
    res.status(500).json({ msg: 'Server error blocking user' });
  }
};

// @desc    Unblock a user
// @route   POST /api/v1/users/unblock
// @access  Private
exports.unblockUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId: blockedUserId } = req.body;
  const blockerId = req.user.id;

  try {
    // Find and delete block record in PocketBase
    const blockRecord = await getPb().collection('blocked_users').getFirstListItem(
      `blocker="${blockerId}" && blocked_user="${blockedUserId}"`
    );

    await getPb().collection('blocked_users').delete(blockRecord.id);

    res.json({ msg: 'User unblocked successfully' });
  } catch (err) {
    console.error('Error unblocking user:', err.message);
    if (err.status === 404) {
      return res.status(404).json({ msg: 'Block record not found' });
    }
    res.status(500).json({ msg: 'Server error unblocking user' });
  }
};

// @desc    Login user
// @route   POST /api/v1/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email) {
    return res.status(400).json({ msg: 'Email is required' });
  }
  if (!password) {
    return res.status(400).json({ msg: 'Password is required' });
  }

  try {
    // Authenticate with PocketBase
    const authData = await getPb().collection('users').authWithPassword(email, password);
    
    // Create JWT
    const token = jwt.sign({ id: authData.record.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    });
    
    res.status(200).json({ token });
  } catch (err) {
    console.error('Error logging in user:', err.message);
    if (err.status === 400) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    res.status(500).json({ msg: 'Server error during login' });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/v1/users/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  console.log('getCurrentUser called');
  try {
    const user = await getPb().collection('users').getOne(req.user.id);
    res.json(user);
  } catch (err) {
    console.error('Error getting current user:', err.message);
    if (err.status === 404) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).json({ msg: 'Server error getting user' });
  }
};
