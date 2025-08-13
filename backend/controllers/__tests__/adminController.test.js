const adminController = require('../adminController');
const pb = require('../../db/pocketbase');

// Mock PocketBase methods
jest.mock('../../db/pocketbase', () => ({
  collection: jest.fn().mockReturnThis(),
  getFullList: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
}));

describe('Admin Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {},
      params: {},
      t: jest.fn((key) => key), // Mock i18n translation function
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('getAllUsers', () => {
    it('should return all users excluding passwords', async () => {
      const mockUsers = [
        { id: 'user1', name: 'User One', email: 'one@example.com', password: 'hashed_password_1' },
        { id: 'user2', name: 'User Two', email: 'two@example.com', password: 'hashed_password_2' },
      ];

      pb.collection.mockReturnThis();
      pb.getFullList.mockResolvedValue(mockUsers);

      await adminController.getAllUsers(mockReq, mockRes, mockNext);

      expect(pb.collection).toHaveBeenCalledWith('users');
      expect(pb.getFullList).toHaveBeenCalledWith({
        filter: 'id != ""',
        fields: '-password'
      });
      expect(mockRes.json).toHaveBeenCalledWith([
        { id: 'user1', name: 'User One', email: 'one@example.com' },
        { id: 'user2', name: 'User Two', email: 'two@example.com' },
      ]);
    });

    it('should handle errors when fetching all users', async () => {
      pb.collection.mockReturnThis();
      pb.getFullList.mockRejectedValue(new Error('Database error'));

      await adminController.getAllUsers(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('server_error');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and associated records successfully', async () => {
      mockReq.params.id = 'user123';

      pb.collection.mockReturnThis();
      pb.delete.mockResolvedValue(true);

      await adminController.deleteUser(mockReq, mockRes, mockNext);

      expect(pb.collection).toHaveBeenCalledWith('profiles');
      expect(pb.delete).toHaveBeenCalledWith('user123');
      expect(pb.collection).toHaveBeenCalledWith('subscriptions');
      expect(pb.delete).toHaveBeenCalledWith('user123');
      expect(pb.collection).toHaveBeenCalledWith('users');
      expect(pb.delete).toHaveBeenCalledWith('user123');
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'user_deleted' });
    });

    it('should handle errors when deleting a user', async () => {
      mockReq.params.id = 'user123';

      pb.collection.mockReturnThis();
      pb.delete.mockRejectedValue(new Error('Delete error'));

      await adminController.deleteUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('server_error');
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      pb.collection.mockReturnThis();
      pb.count
        .mockResolvedValueOnce(100) // totalUsers
        .mockResolvedValueOnce(5)   // newUsersToday
        .mockResolvedValueOnce(20);  // activeSubscriptions

      await adminController.getDashboardStats(mockReq, mockRes, mockNext);

      expect(pb.collection).toHaveBeenCalledWith('users');
      expect(pb.count).toHaveBeenCalledTimes(3); // Corrected from 2 to 3
      expect(pb.collection).toHaveBeenCalledWith('subscriptions');
      expect(pb.count).toHaveBeenCalledTimes(3);
      expect(mockRes.json).toHaveBeenCalledWith({
        totalUsers: 100,
        newUsersToday: 5,
        activeSubscriptions: 20,
        monthlyRevenue: 20 * 299, // 20 active subscriptions * 299 (placeholder)
      });
    });

    it('should handle errors when fetching dashboard stats', async () => {
      pb.collection.mockReturnThis();
      pb.count.mockRejectedValue(new Error('Stats error'));

      await adminController.getDashboardStats(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('server_error');
    });
  });

  describe('getUserGrowthStats', () => {
    it('should return user growth statistics', async () => {
      const mockGrowthData = [
        { date: '2025-07-01', count: 100 },
        { date: '2025-07-08', count: 150 },
      ];

      pb.collection.mockReturnThis();
      pb.getFullList.mockResolvedValue(mockGrowthData);

      await adminController.getUserGrowthStats(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(mockGrowthData);
    });

    it('should handle errors when fetching user growth stats', async () => {
      pb.collection.mockReturnThis();
      pb.getFullList.mockRejectedValue(new Error('Growth stats error'));

      await adminController.getUserGrowthStats(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('server_error');
    });
  });

  describe('getRevenueStats', () => {
    it('should return revenue statistics', async () => {
      const mockRevenueData = [
        { month: 'January 2025', revenue: 25000 },
        { month: 'February 2025', revenue: 28000 },
      ];

      pb.collection.mockReturnThis();
      pb.getFullList.mockResolvedValue(mockRevenueData);

      await adminController.getRevenueStats(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(mockRevenueData);
    });

    it('should handle errors when fetching revenue stats', async () => {
      pb.collection.mockReturnThis();
      pb.getFullList.mockRejectedValue(new Error('Revenue stats error'));

      await adminController.getRevenueStats(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('server_error');
    });
  });
});