const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { protect } = require('../../middleware/auth');
const chatController = require('../../controllers/chatController');

// @route   GET api/v1/chat/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/conversations', protect, chatController.getConversations);

// @route   GET api/v1/chat/messages/:userId
// @desc    Get messages for a conversation
// @access  Private
router.get('/messages/:userId', protect, chatController.getMessages);

// @route   POST api/v1/chat/messages
// @desc    Send a message
// @access  Private
router.post(
  '/messages',
  [
    protect,
    [
      check('recipientId', 'Recipient ID is required').not().isEmpty(),
      check('text', 'Message text is required').not().isEmpty()
    ]
  ],
  chatController.sendMessage
);

module.exports = router;