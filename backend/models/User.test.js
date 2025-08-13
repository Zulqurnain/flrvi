const { createUser, findUserByEmail, findUserById, updateUser, deleteUser, matchPassword, COLLECTION_NAME } = require('./User');
const { pb } = require('../db/pocketbase');
const bcrypt = require('bcryptjs');

// Create a single mock object for the collection methods
const mockCollectionMethods = {
  create: jest.fn(),
  getFirstListItem: jest.fn(),
  getOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Mock PocketBase to return the same mockCollectionMethods instance
jest.mock('../db/pocketbase', () => ({
  pb: {
    collection: jest.fn(() => mockCollectionMethods), // Always return the same mock object
  },
}));

describe('User Model', () => {
  const mockUserData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };

  const mockCreatedUser = {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    last_active: new Date().toISOString(),
    isPremium: false,
    role: 'user',
    passwordHash: 'hashedpassword123', // This would be the actual hashed password from PocketBase
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user and hash the password', async () => {
      const hashedPassword = await bcrypt.hash(mockUserData.password, 10); // Simulate bcrypt hash
      mockCollectionMethods.create.mockResolvedValue({
        ...mockCreatedUser,
        password: hashedPassword,
      });

      const user = await createUser(mockUserData);

      expect(pb.collection).toHaveBeenCalledWith(COLLECTION_NAME);
      expect(mockCollectionMethods.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockUserData.name,
          email: mockUserData.email,
          password: expect.any(String), // Expect a hashed password
          passwordConfirm: expect.any(String), // Expect passwordConfirm to be present
          last_active: expect.any(String),
          isPremium: false,
          role: 'user',
        })
      );
      expect(user).toEqual(expect.objectContaining({
        id: 'user123',
        email: mockUserData.email,
      }));
      // Verify password was hashed (cannot directly check the hash without knowing the salt)
      expect(await bcrypt.compare(mockUserData.password, mockCollectionMethods.create.mock.calls[0][0].password)).toBe(true);
    });

    it('should throw an error if user creation fails', async () => {
      const errorMessage = 'Email already exists';
      mockCollectionMethods.create.mockRejectedValue({
        response: { data: { message: errorMessage } },
        message: errorMessage,
      });

      await expect(createUser(mockUserData)).rejects.toThrow(`Failed to create user: ${errorMessage}`);
    });
  });

  describe('findUserByEmail', () => {
    it('should find a user by email', async () => {
      mockCollectionMethods.getFirstListItem.mockResolvedValue(mockCreatedUser);

      const user = await findUserByEmail(mockUserData.email);

      expect(pb.collection).toHaveBeenCalledWith(COLLECTION_NAME);
      expect(mockCollectionMethods.getFirstListItem).toHaveBeenCalledWith(`email="${mockUserData.email}"`);
      expect(user).toEqual(mockCreatedUser);
    });

    it('should return null if user is not found by email', async () => {
      mockCollectionMethods.getFirstListItem.mockRejectedValue({ status: 404 });

      const user = await findUserByEmail('nonexistent@example.com');

      expect(user).toBeNull();
    });

    it('should throw an error if finding user by email fails for other reasons', async () => {
      const errorMessage = 'Database error';
      mockCollectionMethods.getFirstListItem.mockRejectedValue({ message: errorMessage });

      await expect(findUserByEmail(mockUserData.email)).rejects.toThrow(`Failed to find user by email: ${errorMessage}`);
    });
  });

  describe('findUserById', () => {
    it('should find a user by ID', async () => {
      mockCollectionMethods.getOne.mockResolvedValue(mockCreatedUser);

      const user = await findUserById(mockCreatedUser.id);

      expect(pb.collection).toHaveBeenCalledWith(COLLECTION_NAME);
      expect(mockCollectionMethods.getOne).toHaveBeenCalledWith(mockCreatedUser.id);
      expect(user).toEqual(mockCreatedUser);
    });

    it('should return null if user is not found by ID', async () => {
      mockCollectionMethods.getOne.mockRejectedValue({ status: 404 });

      const user = await findUserById('nonexistentId');

      expect(user).toBeNull();
    });

    it('should throw an error if finding user by ID fails for other reasons', async () => {
      const errorMessage = 'Network error';
      mockCollectionMethods.getOne.mockRejectedValue({ message: errorMessage });

      await expect(findUserById(mockCreatedUser.id)).rejects.toThrow(`Failed to find user by ID: ${errorMessage}`);
    });
  });

  describe('updateUser', () => {
    it('should update a user record', async () => {
      const updateData = { name: 'Updated Name' };
      mockCollectionMethods.update.mockResolvedValue({ ...mockCreatedUser, ...updateData });

      const updatedUser = await updateUser(mockCreatedUser.id, updateData);

      expect(pb.collection).toHaveBeenCalledWith(COLLECTION_NAME);
      expect(mockCollectionMethods.update).toHaveBeenCalledWith(
        mockCreatedUser.id,
        expect.objectContaining({
          name: updateData.name,
          last_active: expect.any(String),
        })
      );
      expect(updatedUser).toEqual(expect.objectContaining({ name: updateData.name }));
    });

    it('should hash password if password is included in update data', async () => {
      const newPassword = 'newPassword123';
      const updateData = { password: newPassword };
      const hashedPassword = await bcrypt.hash(newPassword, 10); // Simulate bcrypt hash
      mockCollectionMethods.update.mockResolvedValue({ ...mockCreatedUser, password: hashedPassword });

      const updatedUser = await updateUser(mockCreatedUser.id, updateData);

      expect(mockCollectionMethods.update).toHaveBeenCalledWith(
        mockCreatedUser.id,
        expect.objectContaining({
          password: expect.any(String),
          passwordConfirm: expect.any(String),
        })
      );
      expect(await bcrypt.compare(newPassword, mockCollectionMethods.update.mock.calls[0][1].password)).toBe(true);
      expect(updatedUser).toEqual(expect.objectContaining({ id: mockCreatedUser.id }));
    });

    it('should throw an error if user update fails', async () => {
      const errorMessage = 'Update failed';
      mockCollectionMethods.update.mockRejectedValue({ message: errorMessage });

      await expect(updateUser(mockCreatedUser.id, { name: 'Fail' })).rejects.toThrow(`Failed to update user: ${errorMessage}`);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user record', async () => {
      mockCollectionMethods.delete.mockResolvedValue(true);

      const result = await deleteUser(mockCreatedUser.id);

      expect(pb.collection).toHaveBeenCalledWith(COLLECTION_NAME);
      expect(mockCollectionMethods.delete).toHaveBeenCalledWith(mockCreatedUser.id);
      expect(result).toBe(true);
    });

    it('should throw an error if user deletion fails', async () => {
      const errorMessage = 'Deletion failed';
      mockCollectionMethods.delete.mockRejectedValue({ message: errorMessage });

      await expect(deleteUser(mockCreatedUser.id)).rejects.toThrow(`Failed to delete user: ${errorMessage}`);
    });
  });

  describe('matchPassword', () => {
    it('should return true for matching passwords', async () => {
      const hashedPassword = await bcrypt.hash(mockUserData.password, 10);
      const isMatch = await matchPassword(mockUserData.password, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const hashedPassword = await bcrypt.hash(mockUserData.password, 10);
      const isMatch = await matchPassword('wrongpassword', hashedPassword);
      expect(isMatch).toBe(false);
    });
  });
});
