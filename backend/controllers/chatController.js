const { getPb } = require('../db/pocketbase');
const { validationResult } = require('express-validator');

// @desc    Get user's conversations
// @route   GET /api/v1/chat/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    // In a real implementation, you would fetch conversations from the database
    // This is a mock implementation for demonstration
    const conversations = [
      {
        id: '1',
        userId: 'user123',
        userName: 'Sarah Johnson',
        lastMessage: 'Hey there! How are you?',
        timestamp: new Date().toISOString(),
        unreadCount: 2,
        isOnline: true
      },
      {
        id: '2',
        userId: 'user456',
        userName: 'Emma Wilson',
        lastMessage: 'See you tomorrow!',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        unreadCount: 0,
        isOnline: false
      }
    ];

    res.json(conversations);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/v1/chat/messages/:userId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // In a real implementation, you would fetch messages from the database
    // This is a mock implementation for demonstration
    const messages = [
      {
        id: '1',
        text: 'Hey there! How are you doing?',
        senderId: userId,
        timestamp: '10:30 AM',
        isOwn: false
      },
      {
        id: '2',
        text: 'I\'m doing great! Just finished work for the day.',
        senderId: req.user.id,
        timestamp: '10:32 AM',
        isOwn: true
      },
      {
        id: '3',
        text: 'That\'s awesome! Want to grab coffee sometime?',
        senderId: userId,
        timestamp: '10:35 AM',
        isOwn: false
      }
    ];

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Send a message
// @route   POST /api/v1/chat/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, text } = req.body;
    const senderId = req.user.id;

    // In a real implementation, you would save the message to the database
    // This is a mock implementation for demonstration
    const newMessage = {
      id: Date.now().toString(),
      text,
      senderId,
      recipientId,
      timestamp: new Date().toISOString(),
      isOwn: true
    };

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};