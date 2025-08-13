const jwt = require('jsonwebtoken');
const { protect } = require('../auth');
const { pb } = require('../../db/pocketbase'); // Adjust path as necessary

// Mock PocketBase
jest.mock('../../db/pocketbase', () => ({
  pb: {
    collection: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  },
}));

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    // Set a dummy JWT secret for testing
    process.env.JWT_SECRET = 'testsecret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next() and attach user if token is valid', async () => {
    const userId = 'user123';
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    req.headers.authorization = `Bearer ${token}`;

    pb.collection().getOne.mockResolvedValue({ id: userId, email: 'test@example.com', name: 'Test User', role: 'user' });

    await protect(req, res, next);

    expect(pb.collection).toHaveBeenCalledWith('users');
    expect(pb.collection().getOne).toHaveBeenCalledWith(userId, { fields: 'id,email,name,role' });
    expect(req.user).toEqual({ id: userId, email: 'test@example.com', name: 'Test User', role: 'user' });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 401 if no token is provided', async () => {
    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized, no token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    req.headers.authorization = 'Bearer invalidtoken';

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized, token failed' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is expired', async () => {
    const userId = 'user123';
    // Create an expired token
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '0s' });
    req.headers.authorization = `Bearer ${token}`;

    // Wait for a short moment to ensure the token expires
    await new Promise(resolve => setTimeout(resolve, 100));

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token expired' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if user is not found in PocketBase', async () => {
    const userId = 'user123';
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    req.headers.authorization = `Bearer ${token}`;

    pb.collection().getOne.mockRejectedValue(new Error('User not found')); // Simulate user not found

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized, token failed' });
    expect(next).not.toHaveBeenCalled();
  });
});
