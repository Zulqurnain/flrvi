const userController = require('../userController');
const { getPb } = require('../../db/pocketbase');
const jwt = require('jsonwebtoken');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret';
process.env.JWT_EXPIRE = '30d'; // Ensure JWT_EXPIRE is set for tests

// Mock PocketBase and its methods
const mockPocketBase = {
  collection: jest.fn().mockReturnThis(),
  getFirstListItem: jest.fn(),
  create: jest.fn(),
  authWithPassword: jest.fn(),
  getOne: jest.fn(),
};

jest.mock('../../db/pocketbase', () => ({
  getPb: jest.fn(() => mockPocketBase),
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

describe('User Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {},
      user: {},
      header: jest.fn(),
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      mockReq.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      getPb().collection.mockReturnThis();
      getPb().getFirstListItem.mockRejectedValue({ status: 404 }); // User doesn't exist
      getPb().create.mockResolvedValue({ id: 'user123' });
      jwt.sign.mockReturnValue('test_token');

      await userController.registerUser(mockReq, mockRes, mockNext);

      expect(getPb().collection).toHaveBeenCalledWith('users');
      expect(getPb().getFirstListItem).toHaveBeenCalledWith('email="test@example.com"');
      expect(getPb().create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        emailVisibility: true,
      });
      expect(jwt.sign).toHaveBeenCalledWith({ id: 'user123' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ token: 'test_token' });
    });

    it('should return 400 if name is missing', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      await userController.registerUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Name is required' });
    });

    it('should return 400 if email is missing', async () => {
      mockReq.body = {
        name: 'Test User',
        password: 'password123',
      };

      await userController.registerUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Email is required' });
    });

    it('should return 400 if password is missing', async () => {
      mockReq.body = {
        name: 'Test User',
        email: 'test@example.com',
      };

      await userController.registerUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Password is required' });
    });

    it('should return 400 if email format is invalid', async () => {
      mockReq.body = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      };

      await userController.registerUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Invalid email format' });
    });

    it('should return 400 if password is too short', async () => {
      mockReq.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'short',
      };

      await userController.registerUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Password must be at least 6 characters' });
    });

    it('should return 400 if user already exists', async () => {
      mockReq.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      getPb().collection.mockReturnThis();
      getPb().getFirstListItem.mockResolvedValue({ id: 'existing_user' });

      await userController.registerUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'User already exists' });
    });

    it('should return 500 for server error during registration', async () => {
      mockReq.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      getPb().collection.mockReturnThis();
      getPb().getFirstListItem.mockRejectedValue(new Error('Database error')); // Simulate a generic database error

      await userController.registerUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Server error during user check' });
    });
  });

  describe('loginUser', () => {
    it('should login a user successfully', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      getPb().collection.mockReturnThis();
      getPb().authWithPassword.mockResolvedValue({
        record: { id: 'user123' },
      });
      jwt.sign.mockReturnValue('test_token');

      await userController.loginUser(mockReq, mockRes, mockNext);

      expect(getPb().collection).toHaveBeenCalledWith('users');
      expect(getPb().authWithPassword).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(jwt.sign).toHaveBeenCalledWith({ id: 'user123' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ token: 'test_token' });
    });

    it('should return 400 if email is missing', async () => {
      mockReq.body = {
        password: 'password123',
      };

      await userController.loginUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Email is required' });
    });

    it('should return 400 if password is missing', async () => {
      mockReq.body = {
        email: 'test@example.com',
      };

      await userController.loginUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Password is required' });
    });

    it('should return 400 for invalid credentials', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      getPb().collection.mockReturnThis();
      getPb().authWithPassword.mockRejectedValue({ status: 400 });

      await userController.loginUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Invalid credentials' });
    });

    it('should return 500 for server error during login', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      getPb().collection.mockReturnThis();
      getPb().authWithPassword.mockRejectedValue(new Error('Network error')); // Simulate a generic network error

      await userController.loginUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Server error during login' });
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      mockReq.user = { id: 'user123' }; // Mock user from auth middleware
      
      getPb().collection.mockReturnThis();
      getPb().getOne.mockResolvedValue({ id: 'user123', name: 'Test User' });

      await userController.getCurrentUser(mockReq, mockRes, mockNext);

      expect(getPb().collection).toHaveBeenCalledWith('users');
      expect(getPb().getOne).toHaveBeenCalledWith('user123');
      expect(mockRes.json).toHaveBeenCalledWith({ id: 'user123', name: 'Test User' });
    });

    it('should return 404 if user not found', async () => {
      mockReq.user = { id: 'nonexistent_user' };

      getPb().collection.mockReturnThis();
      getPb().getOne.mockRejectedValue({ status: 404 });

      await userController.getCurrentUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'User not found' });
    });

    it('should return 500 for server error when getting current user', async () => {
      mockReq.user = { id: 'user123' };

      getPb().collection.mockReturnThis();
      getPb().getOne.mockRejectedValue(new Error('Database connection lost')); // Simulate a generic database error

      await userController.getCurrentUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Server error getting user' });
    });
  });
});
