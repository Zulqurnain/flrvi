const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { protect } = require('../../middleware/auth');
const profileController = require('../../controllers/profileController');

// @route   GET api/v1/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', protect, profileController.getCurrentUserProfile);

// @route   POST api/v1/profile
// @desc    Create or update user profile
// @access  Private
router.post(
  '/',
  [
    protect,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('gender', 'Gender is required').isIn(['Man', 'Woman', 'Other']),
      check('birthdate', 'Birthdate is required').isISO8601(),
      check('location.city', 'City is required').not().isEmpty(),
      check('photos', 'At least one photo is required').isArray({ min: 1 }),
      check('preferences.gender', 'Preferred gender is required').isIn(['Man', 'Woman', 'Any']),
      check('preferences.ageRange.min', 'Minimum age must be between 18-100').isInt({ min: 18, max: 100 }),
      check('preferences.ageRange.max', 'Maximum age must be between 18-100').isInt({ min: 18, max: 100 }),
      check('preferences.distance', 'Distance preference must be between 1-100 km').isInt({ min: 1, max: 100 })
    ]
  ],
  profileController.createOrUpdateProfile
);

// @route   GET api/v1/profile/user/:userId
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:userId', profileController.getProfileByUserId);

// @route   PUT api/v1/profile/active
// @desc    Update last active timestamp
// @access  Private
router.put('/active', protect, profileController.updateLastActive);

// @route   GET api/v1/profile/search
// @desc    Search user profiles
// @access  Private
router.get('/search', protect, profileController.searchProfiles);

module.exports = router;
