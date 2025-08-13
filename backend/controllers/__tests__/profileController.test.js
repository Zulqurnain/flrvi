const { getPb } = require('../../db/pocketbase');
const { validationResult } = require('express-validator');
const profileController = require('../profileController');

// Mock PocketBase
jest.mock('../../db/pocketbase', () => ({
  getPb: jest.fn(() => ({
    collection: jest.fn(() => ({
      getFirstListItem: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      getList: jest.fn(),
    })),
  })),
}));

// Mock express-validator
jest.mock('express-validator', () => ({
  validationResult: jest.fn(() => ({
    isEmpty: jest.fn(() => true),
    array: jest.fn(() => []),
  })),
}));

describe('profileController', () => {
  let mockReq;
  let mockRes;
  let mockPb;

  beforeEach(() => {
    mockReq = {
      user: { id: 'user123' },
      params: {},
      body: {},
      query: {},
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockPb = getPb();
    mockPb.collection().getFirstListItem.mockClear();
    mockPb.collection().update.mockClear();
    mockPb.collection().create.mockClear();
    mockPb.collection().getList.mockClear();
    validationResult.mockClear();
  });

  describe('getCurrentUserProfile', () => {
    it('should return the current user profile if found', async () => {
      const mockProfile = { id: 'profile123', user: 'user123', name: 'Test User' };
      mockPb.collection().getFirstListItem.mockResolvedValue(mockProfile);

      await profileController.getCurrentUserProfile(mockReq, mockRes);

      expect(mockPb.collection().getFirstListItem).toHaveBeenCalledWith('user="user123"');
      expect(mockRes.json).toHaveBeenCalledWith(mockProfile);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 404 if profile not found', async () => {
      const error = new Error('Profile not found');
      error.status = 404;
      mockPb.collection().getFirstListItem.mockRejectedValue(error);

      await profileController.getCurrentUserProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Profile not found' });
    });

    it('should return 500 for server error', async () => {
      const error = new Error('Database error');
      mockPb.collection().getFirstListItem.mockRejectedValue(error);
      console.error = jest.fn(); // Mock console.error to prevent test output

      await profileController.getCurrentUserProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Server error' });
      expect(console.error).toHaveBeenCalledWith(error.message);
    });
  });

  describe('createOrUpdateProfile', () => {
    const profileData = {
      name: 'John Doe',
      bio: 'A test bio',
      gender: 'male',
      birthdate: '1990-01-01',
      location: 'New York',
      photos: ['photo1.jpg'],
      interests: 'reading, coding',
      preferences: { minAge: 20, maxAge: 30 },
    };

    beforeEach(() => {
      mockReq.body = { ...profileData };
    });

    it('should create a new profile if one does not exist', async () => {
      validationResult.mockReturnValue({ isEmpty: () => true, array: () => [] });
      mockPb.collection().getFirstListItem.mockRejectedValue({ status: 404 }); // Profile not found
      mockPb.collection().create.mockResolvedValue({ id: 'newProfile123', ...profileData });

      await profileController.createOrUpdateProfile(mockReq, mockRes);

      expect(mockPb.collection().getFirstListItem).toHaveBeenCalledWith('user="user123"');
      expect(mockPb.collection().create).toHaveBeenCalledWith(expect.objectContaining({
        user: 'user123',
        name: 'John Doe',
        bio: 'A test bio',
        gender: 'male',
        location: 'New York',
        photos: ['photo1.jpg'],
        interests: ['reading', 'coding'],
        preferences: { minAge: 20, maxAge: 30 },
      }));
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ id: 'newProfile123' }));
    });

    it('should update an existing profile if one exists', async () => {
      validationResult.mockReturnValue({ isEmpty: () => true, array: () => [] });
      const existingProfile = { id: 'existingProfile123', user: 'user123', name: 'Old Name' };
      mockPb.collection().getFirstListItem.mockResolvedValue(existingProfile);
      mockPb.collection().update.mockResolvedValue({ id: 'existingProfile123', ...profileData });

      await profileController.createOrUpdateProfile(mockReq, mockRes);

      expect(mockPb.collection().getFirstListItem).toHaveBeenCalledWith('user="user123"');
      expect(mockPb.collection().update).toHaveBeenCalledWith('existingProfile123', expect.objectContaining({
        user: 'user123',
        name: 'John Doe',
      }));
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ id: 'existingProfile123' }));
      expect(mockRes.status).not.toHaveBeenCalledWith(201); // Should not be 201 for update
    });

    it('should return 400 if validation fails', async () => {
      validationResult.mockReturnValue({ isEmpty: () => false, array: () => [{ msg: 'Name is required' }] });

      await profileController.createOrUpdateProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ errors: [{ msg: 'Name is required' }] });
      expect(mockPb.collection().create).not.toHaveBeenCalled();
      expect(mockPb.collection().update).not.toHaveBeenCalled();
    });

    it('should handle server errors during profile creation/update', async () => {
      validationResult.mockReturnValue({ isEmpty: () => true, array: () => [] });
      const error = new Error('Database write error');
      mockPb.collection().getFirstListItem.mockRejectedValue({ status: 404 });
      mockPb.collection().create.mockRejectedValue(error);
      console.error = jest.fn();

      await profileController.createOrUpdateProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Server error' });
      expect(console.error).toHaveBeenCalledWith(error.message);
    });
  });

  describe('getProfileByUserId', () => {
    beforeEach(() => {
      mockReq.params.userId = 'anotherUser456';
    });

    it('should return the profile for a given user ID', async () => {
      const mockProfile = { id: 'profile456', user: 'anotherUser456', name: 'Another User' };
      mockPb.collection().getFirstListItem.mockResolvedValue(mockProfile);

      await profileController.getProfileByUserId(mockReq, mockRes);

      expect(mockPb.collection().getFirstListItem).toHaveBeenCalledWith('user="anotherUser456"');
      expect(mockRes.json).toHaveBeenCalledWith(mockProfile);
    });

    it('should return 404 if profile not found for given ID', async () => {
      const error = new Error('Profile not found');
      error.status = 404;
      mockPb.collection().getFirstListItem.mockRejectedValue(error);

      await profileController.getProfileByUserId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Profile not found' });
    });

    it('should return 500 for server error when getting profile by ID', async () => {
      const error = new Error('Database error');
      mockPb.collection().getFirstListItem.mockRejectedValue(error);
      console.error = jest.fn();

      await profileController.getProfileByUserId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Server error' });
      expect(console.error).toHaveBeenCalledWith(error.message);
    });
  });

  describe('updateLastActive', () => {
    it('should update the lastActive timestamp for the current user', async () => {
      const existingProfile = { id: 'profile123', user: 'user123', lastActive: '2024-01-01T00:00:00.000Z' };
      const updatedProfile = { ...existingProfile, lastActive: new Date().toISOString() };
      mockPb.collection().getFirstListItem.mockResolvedValue(existingProfile);
      mockPb.collection().update.mockResolvedValue(updatedProfile);

      await profileController.updateLastActive(mockReq, mockRes);

      expect(mockPb.collection().getFirstListItem).toHaveBeenCalledWith('user="user123"');
      expect(mockPb.collection().update).toHaveBeenCalledWith('profile123', expect.objectContaining({
        lastActive: expect.any(String),
      }));
      expect(mockRes.json).toHaveBeenCalledWith(updatedProfile);
    });

    it('should return 404 if profile not found for last active update', async () => {
      const error = new Error('Profile not found');
      error.status = 404;
      mockPb.collection().getFirstListItem.mockRejectedValue(error);

      await profileController.updateLastActive(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Profile not found' });
    });

    it('should return 500 for server error during last active update', async () => {
      const error = new Error('Database error');
      mockPb.collection().getFirstListItem.mockRejectedValue(error);
      console.error = jest.fn();

      await profileController.updateLastActive(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Server error' });
      expect(console.error).toHaveBeenCalledWith(error.message);
    });
  });

  describe('searchProfiles', () => {
    const mockProfiles = {
      page: 1,
      perPage: 10,
      totalItems: 1,
      totalPages: 1,
      items: [{
        id: 'profileSearch1',
        user: 'userSearch1',
        name: 'Search User',
        bio: 'Search bio',
        gender: 'female',
        birthdate: '1995-05-15 00:00:00.000Z', // Age 29
        location: 'London',
        photos: ['search_photo.jpg'],
        interests: ['travel', 'music'],
        lastActive: new Date().toISOString(),
        expand: {
          user: { id: 'userSearch1', name: 'Search User' }
        }
      }]
    };

    beforeEach(() => {
      mockPb.collection().getList.mockResolvedValue(mockProfiles);
    });

    it('should search profiles with default pagination and sort by lastActive', async () => {
      mockReq.query = {};
      await profileController.searchProfiles(mockReq, mockRes);

      expect(mockPb.collection().getList).toHaveBeenCalledWith(1, 10, {
        filter: '',
        sort: '-lastActive',
        expand: 'user'
      });
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        page: 1,
        perPage: 10,
        totalItems: 1,
        totalPages: 1,
        items: expect.arrayContaining([
          expect.objectContaining({
            _id: 'profileSearch1',
            user: { _id: 'userSearch1', name: 'Search User' },
            primaryPhoto: 'search_photo.jpg',
            age: expect.any(Number),
            location: 'London',
            isOnline: true,
          })
        ])
      }));
    });

    it('should apply age filter', async () => {
      mockReq.query = { age_min: '25', age_max: '30' };
      await profileController.searchProfiles(mockReq, mockRes);

      const currentYear = new Date().getFullYear();
      const minBirthYear = currentYear - 30;
      const maxBirthYear = currentYear - 25;

      expect(mockPb.collection().getList).toHaveBeenCalledWith(1, 10, {
        filter: expect.stringContaining(`birthdate >= "${minBirthYear}-01-01 00:00:00.000Z"`),
        sort: '-lastActive',
        expand: 'user'
      });
      expect(mockPb.collection().getList).toHaveBeenCalledWith(1, 10, {
        filter: expect.stringContaining(`birthdate <= "${maxBirthYear}-12-31 23:59:59.999Z"`),
        sort: '-lastActive',
        expand: 'user'
      });
    });

    it('should apply gender filter', async () => {
      mockReq.query = { gender: 'female' };
      await profileController.searchProfiles(mockReq, mockRes);

      expect(mockPb.collection().getList).toHaveBeenCalledWith(1, 10, {
        filter: 'gender = "female"',
        sort: '-lastActive',
        expand: 'user'
      });
    });

    it('should apply location filter', async () => {
      mockReq.query = { location: 'London' };
      await profileController.searchProfiles(mockReq, mockRes);

      expect(mockPb.collection().getList).toHaveBeenCalledWith(1, 10, {
        filter: 'location ~ "London"',
        sort: '-lastActive',
        expand: 'user'
      });
    });

    it('should apply interests filter', async () => {
      mockReq.query = { interests: 'travel, music' };
      await profileController.searchProfiles(mockReq, mockRes);

      expect(mockPb.collection().getList).toHaveBeenCalledWith(1, 10, {
        filter: '(interests ~ "travel" || interests ~ "music")',
        sort: '-lastActive',
        expand: 'user'
      });
    });

    it('should apply all filters combined', async () => {
      mockReq.query = {
        age_min: '25',
        age_max: '30',
        gender: 'female',
        location: 'London',
        interests: 'travel, music',
        page: '2',
        perPage: '5'
      };
      await profileController.searchProfiles(mockReq, mockRes);

      const currentYear = new Date().getFullYear();
      const minBirthYear = currentYear - 30;
      const maxBirthYear = currentYear - 25;

      expect(mockPb.collection().getList).toHaveBeenCalledWith(2, 5, {
        filter: expect.stringContaining(
          `birthdate >= "${minBirthYear}-01-01 00:00:00.000Z"` +
          ` && birthdate <= "${maxBirthYear}-12-31 23:59:59.999Z"` +
          ` && gender = "female"` +
          ` && location ~ "London"` +
          ` && (interests ~ "travel" || interests ~ "music")`
        ),
        sort: '-lastActive',
        expand: 'user'
      });
    });

    it('should return 500 for server error during search', async () => {
      const error = new Error('Search database error');
      mockPb.collection().getList.mockRejectedValue(error);
      console.error = jest.fn();

      await profileController.searchProfiles(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Server error' });
      expect(console.error).toHaveBeenCalledWith(error.message);
    });
  });
});
