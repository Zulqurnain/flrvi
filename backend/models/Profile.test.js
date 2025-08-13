const Profile = require('./Profile');
const { getPb } = require('../db/pocketbase'); // Import getPb

// Create a single mock object for the collection methods
const mockCollectionMethods = {
  create: jest.fn(),
  getFirstListItem: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getOne: jest.fn(), // Add getOne for potential future use or consistency
};

// Mock PocketBase to return the same mockCollectionMethods instance
jest.mock('../db/pocketbase', () => {
  const mockPbInstance = {
    collection: jest.fn(() => mockCollectionMethods),
  };
  return {
    getPb: jest.fn(() => mockPbInstance),
    setPb: jest.fn(), // Also mock setPb if it's exported, though not used in Profile.js
  };
});

describe('Profile Model', () => {
  let profileModel;
  const COLLECTION_NAME = 'profiles'; // Assuming 'profiles' is the collection name

  const mockProfileData = {
    user: 'user123',
    bio: 'A test bio',
    photos: ['photo1.jpg', 'photo2.jpg'],
    location: 'Test City',
    interests: ['coding', 'reading'],
    age: 30,
    gender: 'Man',
  };

  const mockCreatedProfile = {
    id: 'profile456',
    ...mockProfileData,
    collectionId: 'profiles_collection_id',
    collectionName: 'profiles',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    profileModel = new Profile();
  });

  describe('constructor', () => {
    it('should initialize the collection with "profiles"', () => {
      expect(getPb().collection).toHaveBeenCalledWith(COLLECTION_NAME); // Use getPb()
    });
  });

  describe('create', () => {
    it('should create a new profile', async () => {
      mockCollectionMethods.create.mockResolvedValue(mockCreatedProfile);

      const profile = await profileModel.create(mockProfileData);

      expect(mockCollectionMethods.create).toHaveBeenCalledWith(mockProfileData);
      expect(profile).toEqual(mockCreatedProfile);
    });

    it('should throw an error if profile creation fails', async () => {
      const error = new Error('Failed to create profile');
      mockCollectionMethods.create.mockRejectedValue(error);

      await expect(profileModel.create(mockProfileData)).rejects.toThrow(error);
    });
  });

  describe('findByUserId', () => {
    it('should find a profile by user ID', async () => {
      mockCollectionMethods.getFirstListItem.mockResolvedValue(mockCreatedProfile);

      const profile = await profileModel.findByUserId(mockProfileData.user);

      expect(mockCollectionMethods.getFirstListItem).toHaveBeenCalledWith(`user="${mockProfileData.user}"`);
      expect(profile).toEqual(mockCreatedProfile);
    });

    it('should return null if profile is not found by user ID', async () => {
      mockCollectionMethods.getFirstListItem.mockRejectedValue({ status: 404 });

      const profile = await profileModel.findByUserId('nonexistentUser');

      expect(profile).toBeNull();
    });

    it('should throw an error if finding profile by user ID fails for other reasons', async () => {
      const error = new Error('Database error');
      mockCollectionMethods.getFirstListItem.mockRejectedValue(error);

      await expect(profileModel.findByUserId(mockProfileData.user)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update an existing profile', async () => {
      const updateData = { bio: 'Updated bio', location: 'New City' };
      const updatedProfile = { ...mockCreatedProfile, ...updateData };
      mockCollectionMethods.update.mockResolvedValue(updatedProfile);

      const profile = await profileModel.update(mockCreatedProfile.id, updateData);

      expect(mockCollectionMethods.update).toHaveBeenCalledWith(mockCreatedProfile.id, updateData);
      expect(profile).toEqual(updatedProfile);
    });

    it('should throw an error if profile update fails', async () => {
      const error = new Error('Update failed');
      mockCollectionMethods.update.mockRejectedValue(error);

      await expect(profileModel.update(mockCreatedProfile.id, { bio: 'Fail' })).rejects.toThrow(error);
    });
  });

  describe('delete', () => {
    it('should delete a profile by ID', async () => {
      mockCollectionMethods.delete.mockResolvedValue(true);

      const result = await profileModel.delete(mockCreatedProfile.id);

      expect(mockCollectionMethods.delete).toHaveBeenCalledWith(mockCreatedProfile.id);
      expect(result).toBe(true);
    });

    it('should throw an error if profile deletion fails', async () => {
      const error = new Error('Deletion failed');
      mockCollectionMethods.delete.mockRejectedValue(error);

      await expect(profileModel.delete(mockCreatedProfile.id)).rejects.toThrow(error);
    });
  });
});
