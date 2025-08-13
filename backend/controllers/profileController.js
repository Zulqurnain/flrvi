const { getPb } = require('../db/pocketbase');
const { validationResult } = require('express-validator');

// @desc    Get current user's profile
// @route   GET /api/v1/profile/me
// @access  Private
exports.getCurrentUserProfile = async (req, res) => {
  try {
    // Get profile from PocketBase
    const profile = await getPb().collection('profiles').getFirstListItem(`user="${req.user.id}"`);
    res.json(profile);
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Create or update user profile
// @route   POST /api/v1/profile
// @access  Private
exports.createOrUpdateProfile = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    bio,
    gender,
    birthdate,
    location,
    photos,
    interests,
    preferences
  } = req.body;

  // Build profile object
  const profileFields = {
    user: req.user.id,
    name,
    bio,
    gender,
    birthdate: new Date(birthdate).toISOString(),
    location,
    photos,
    interests: interests ? interests.split(',').map(interest => interest.trim()) : [],
    preferences
  };

  try {
    // Check if profile exists
    let profile;
    try {
      profile = await getPb().collection('profiles').getFirstListItem(`user="${req.user.id}"`);
    } catch (err) {
      if (err.status !== 404) throw err;
    }

    if (profile) {
      // Update existing profile
      const updatedProfile = await getPb().collection('profiles').update(profile.id, profileFields);
      return res.json(updatedProfile);
    }

    // Create new profile
    const newProfile = await getPb().collection('profiles').create(profileFields);
    res.status(201).json(newProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get profile by user ID
// @route   GET /api/v1/profile/user/:userId
// @access  Public
exports.getProfileByUserId = async (req, res) => {
  try {
    const profile = await getPb().collection('profiles').getFirstListItem(`user="${req.params.userId}"`);
    res.json(profile);
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Update last active timestamp
// @route   PUT /api/v1/profile/active
// @access  Private
exports.updateLastActive = async (req, res) => {
  try {
    // Get profile
    const profile = await getPb().collection('profiles').getFirstListItem(`user="${req.user.id}"`);
    
    // Update lastActive
    const updatedProfile = await getPb().collection('profiles').update(profile.id, {
      lastActive: new Date().toISOString()
    });
    
    res.json(updatedProfile);
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Search user profiles
// @route   GET /api/v1/profile/search
// @access  Private
exports.searchProfiles = async (req, res) => {
  try {
    const { age_min, age_max, gender, location, interests } = req.query;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10; // Number of profiles per page, default to 10

    let filter = '';
    const filterConditions = [];

    // Age filter
    if (age_min || age_max) {
      const currentYear = new Date().getFullYear();
      if (age_max) {
        const minBirthYear = currentYear - parseInt(age_max);
        filterConditions.push(`birthdate >= "${minBirthYear}-01-01 00:00:00.000Z"`);
      }
      if (age_min) {
        const maxBirthYear = currentYear - parseInt(age_min);
        filterConditions.push(`birthdate <= "${maxBirthYear}-12-31 23:59:59.999Z"`);
      }
    }

    // Gender filter
    if (gender) {
      filterConditions.push(`gender = "${gender}"`);
    }

    // Location filter (case-insensitive partial match)
    if (location) {
      filterConditions.push(`location ~ "${location}"`);
    }

    // Interests filter (case-insensitive partial match for any interest in the list)
    if (interests) {
      const interestArray = interests.split(',').map(i => i.trim());
      const interestFilters = interestArray.map(i => `interests ~ "${i}"`).join(' || ');
      filterConditions.push(`(${interestFilters})`);
    }

    if (filterConditions.length > 0) {
      filter = filterConditions.join(' && ');
    }

    const profiles = await getPb().collection('profiles').getList(page, perPage, {
      filter: filter,
      sort: '-lastActive', // Sort by last active, newest first
      expand: 'user' // Expand user relation to get user details
    });

    // Format profiles to match ProfileSummary schema
    const formattedProfiles = profiles.items.map(profile => {
      const birthdate = new Date(profile.birthdate);
      const ageDiffMs = Date.now() - birthdate.getTime();
      const ageDate = new Date(ageDiffMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);

      return {
        _id: profile.id,
        user: {
          _id: profile.expand.user.id,
          name: profile.expand.user.name
        },
        primaryPhoto: profile.photos && profile.photos.length > 0 ? profile.photos[0] : null,
        age: age,
        location: profile.location,
        isOnline: profile.lastActive ? (new Date() - new Date(profile.lastActive)) < (5 * 60 * 1000) : false // Online if active in last 5 minutes
      };
    });

    res.json({
      page: profiles.page,
      perPage: profiles.perPage,
      totalItems: profiles.totalItems,
      totalPages: profiles.totalPages,
      items: formattedProfiles
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
