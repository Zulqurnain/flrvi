const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../../controllers/userController');
const { protect } = require('../../middleware/auth');

// @route   GET api/v1/users/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, userController.getCurrentUser);

// @route   PUT api/v1/users/settings/notifications
// @desc    Update user notification settings
// @access  Private
router.put(
  '/settings/notifications',
  [
    protect,
    [
      check('newMessages', 'New messages setting is required').isBoolean(),
      check('newLikes', 'New likes setting is required').isBoolean(),
      check('appUpdates', 'App updates setting is required').isBoolean()
    ]
  ],
  userController.updateNotificationSettings
);

// @route   PUT api/v1/users/settings/language
// @desc    Update user language preference
// @access  Private
router.put(
  '/settings/language',
  [
    protect,
    [
      check('language', 'Language is required').isIn(['en', 'th'])
    ]
  ],
  userController.updateLanguage
);

// @route   GET api/v1/users/blocked
// @desc    Get list of blocked users
// @access  Private
router.get('/blocked', protect, userController.getBlockedUsers);

// @route   POST api/v1/users/block
// @desc    Block a user
// @access  Private
router.post(
  '/block',
  [
    protect,
    [
      check('userId', 'User ID is required').not().isEmpty()
    ]
  ],
  userController.blockUser
);

// @route   POST api/v1/users/unblock
// @desc    Unblock a user
// @access  Private
router.post(
  '/unblock',
  [
    protect,
    [
      check('userId', 'User ID is required').not().isEmpty()
    ]
  ],
  userController.unblockUser
);

module.exports = router;
