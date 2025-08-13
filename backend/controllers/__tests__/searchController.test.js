const profileController = require('../profileController');
const { getPb } = require('../../db/pocketbase');

// Mock PocketBase and its methods
const mockPocketBase = {
  collection: jest.fn(() => mockPocketBase), // Ensure collection returns the mock itself for chaining
  getList: jest.fn(),
};

jest.mock('../../db/pocketbase', () => ({
  getPb: jest.fn(() => mockPocketBase),
}));

describe('Profile Search Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      user: { id: 'user123' },
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('searchProfiles', () => {
    it('should return profiles with no filters and default pagination', async () => {
      const mockProfiles = {
        page: 1,
        perPage: 10,
        totalItems: 2,
        totalPages: 1,
        items: [
          {
            id: 'profile1',
            user: 'userA',
            name: 'User A',
            birthdate: '1990-05-15T00:00:00.000Z',
            location: 'Bangkok',
            photos: ['photo1.jpg'],
            lastActive: new Date().toISOString(),
            expand: { user: { id: 'userA', name: 'User A' } }
          },
          {
            id: 'profile2',
            user: 'userB',
            name: 'User B',
            birthdate: '1992-08-20T00:00:00.000Z',
            location: 'Chiang Mai',
            photos: ['photo2.jpg'],
            lastActive: new Date().toISOString(),
            expand: { user: { id: 'userB', name: 'User B' } }
          },
        ],
      };
      mockPocketBase.getList.mockResolvedValue(mockProfiles);

      await profileController.searchProfiles(mockReq, mockRes);

      expect(getPb().collection).toHaveBeenCalledWith('profiles');
      expect(mockPocketBase.getList).toHaveBeenCalledWith(1, 10, {
        filter: '',
        sort: '-lastActive',
        expand: 'user',
      });
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        page: 1,
        perPage: 10,
        totalItems: 2,
        totalPages: 1,
        items: expect.arrayContaining([
          expect.objectContaining({ _id: 'profile1', user: { _id: 'userA', name: 'User A' } }),
          expect.objectContaining({ _id: 'profile2', user: { _id: 'userB', name: 'User B' } }),
        ]),
      }));
      expect(mockRes.json.mock.calls[0][0].items[0].age).toBeGreaterThanOrEqual(30);
    });

    it('should filter by age_min and age_max', async () => {
      mockReq.query = { age_min: '25', age_max: '30' };
      const mockProfiles = {
        page: 1,
        perPage: 10,
        totalItems: 1,
        totalPages: 1,
        items: [
          {
            id: 'profile3',
            user: 'userC',
            name: 'User C',
            birthdate: '1998-01-01T00:00:00.000Z', // Age 27 in 2025
            location: 'Phuket',
            photos: [],
            lastActive: new Date().toISOString(),
            expand: { user: { id: 'userC', name: 'User C' } }
          },
        ],
      };
      mockPocketBase.getList.mockResolvedValue(mockProfiles);

      await profileController.searchProfiles(mockReq, mockRes);

      const currentYear = new Date().getFullYear();
      const minBirthYear = currentYear - 30;
      const maxBirthYear = currentYear - 25;

      expect(mockPocketBase.getList).toHaveBeenCalledWith(1, 10, expect.objectContaining({
        filter: expect.stringContaining(`birthdate >= "${minBirthYear}-01-01 00:00:00.000Z"`) &&
                expect.stringContaining(`birthdate <= "${maxBirthYear}-12-31 23:59:59.999Z"`),
      }));
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({ _id: 'profile3' }),
        ]),
      }));
    });

    it('should filter by gender', async () => {
      mockReq.query = { gender: 'Woman' };
      const mockProfiles = {
        page: 1,
        perPage: 10,
        totalItems: 1,
        totalPages: 1,
        items: [
          {
            id: 'profile4',
            user: 'userD',
            name: 'User D',
            birthdate: '1995-03-10T00:00:00.000Z',
            location: 'Bangkok',
            gender: 'Woman',
            photos: [],
            lastActive: new Date().toISOString(),
            expand: { user: { id: 'userD', name: 'User D' } }
          },
        ],
      };
      mockPocketBase.getList.mockResolvedValue(mockProfiles);

      await profileController.searchProfiles(mockReq, mockRes);

      expect(mockPocketBase.getList).toHaveBeenCalledWith(1, 10, expect.objectContaining({
        filter: 'gender = "Woman"',
      }));
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({ _id: 'profile4' }),
        ]),
      }));
    });

    it('should filter by location', async () => {
      mockReq.query = { location: 'Bangkok' };
      const mockProfiles = {
        page: 1,
        perPage: 10,
        totalItems: 1,
        totalPages: 1,
        items: [
          {
            id: 'profile5',
            user: 'userE',
            name: 'User E',
            birthdate: '1988-11-22T00:00:00.000Z',
            location: 'Bangkok',
            photos: [],
            lastActive: new Date().toISOString(),
            expand: { user: { id: 'userE', name: 'User E' } }
          },
        ],
      };
      mockPocketBase.getList.mockResolvedValue(mockProfiles);

      await profileController.searchProfiles(mockReq, mockRes);

      expect(mockPocketBase.getList).toHaveBeenCalledWith(1, 10, expect.objectContaining({
        filter: 'location ~ "Bangkok"',
      }));
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({ _id: 'profile5' }),
        ]),
      }));
    });

    it('should filter by interests', async () => {
      mockReq.query = { interests: 'hiking,reading' };
      const mockProfiles = {
        page: 1,
        perPage: 10,
        totalItems: 1,
        totalPages: 1,
        items: [
          {
            id: 'profile6',
            user: 'userF',
            name: 'User F',
            birthdate: '1993-07-07T00:00:00.000Z',
            location: 'Pattaya',
            interests: ['hiking', 'cooking'],
            photos: [],
            lastActive: new Date().toISOString(),
            expand: { user: { id: 'userF', name: 'User F' } }
          },
        ],
      };
      mockPocketBase.getList.mockResolvedValue(mockProfiles);

      await profileController.searchProfiles(mockReq, mockRes);

      expect(mockPocketBase.getList).toHaveBeenCalledWith(1, 10, expect.objectContaining({
        filter: '(interests ~ "hiking" || interests ~ "reading")',
      }));
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({ _id: 'profile6' }),
        ]),
      }));
    });

    it('should combine multiple filters', async () => {
      mockReq.query = { age_min: '30', gender: 'Man', location: 'Bangkok', interests: 'sports' };
      const mockProfiles = {
        page: 1,
        perPage: 10,
        totalItems: 1,
        totalPages: 1,
        items: [
          {
            id: 'profile7',
            user: 'userG',
            name: 'User G',
            birthdate: '1990-01-01T00:00:00.000Z', // Age 35 in 2025
            location: 'Bangkok',
            gender: 'Man',
            interests: ['sports', 'movies'],
            photos: [],
            lastActive: new Date().toISOString(),
            expand: { user: { id: 'userG', name: 'User G' } }
          },
        ],
      };
      mockPocketBase.getList.mockResolvedValue(mockProfiles);

      await profileController.searchProfiles(mockReq, mockRes);

      const currentYear = new Date().getFullYear();
      const maxBirthYear = currentYear - 30;

      expect(mockPocketBase.getList).toHaveBeenCalledWith(1, 10, expect.objectContaining({
        filter: expect.stringContaining(`birthdate <= "${maxBirthYear}-12-31 23:59:59.999Z"`) &&
                expect.stringContaining('gender = "Man"') &&
                expect.stringContaining('location ~ "Bangkok"') &&
                expect.stringContaining('(interests ~ "sports")'),
      }));
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({ _id: 'profile7' }),
        ]),
      }));
    });

    it('should handle pagination correctly', async () => {
      mockReq.query = { page: '2' };
      const mockProfiles = {
        page: 2,
        perPage: 10,
        totalItems: 15,
        totalPages: 2,
        items: [
          {
            id: 'profile8',
            user: 'userH',
            name: 'User H',
            birthdate: '1991-02-02T00:00:00.000Z',
            location: 'Bangkok',
            photos: [],
            lastActive: new Date().toISOString(),
            expand: { user: { id: 'userH', name: 'User H' } }
          },
        ],
      };
      mockPocketBase.getList.mockResolvedValue(mockProfiles);

      await profileController.searchProfiles(mockReq, mockRes);

      expect(mockPocketBase.getList).toHaveBeenCalledWith(2, 10, expect.objectContaining({
        filter: '',
        sort: '-lastActive',
        expand: 'user',
      }));
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        page: 2,
        perPage: 10,
        totalItems: 15,
        totalPages: 2,
        items: expect.arrayContaining([
          expect.objectContaining({ _id: 'profile8' }),
        ]),
      }));
    });

    it('should return 500 for server error', async () => {
      mockPocketBase.getList.mockRejectedValue(new Error('Database error'));

      await profileController.searchProfiles(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Server error' });
    });

    it('should correctly calculate age', async () => {
      mockReq.query = {};
      const mockProfiles = {
        page: 1,
        perPage: 10,
        totalItems: 1,
        totalPages: 1,
        items: [
          {
            id: 'profileAgeTest',
            user: 'userAge',
            name: 'User Age',
            birthdate: '2000-08-11T00:00:00.000Z', // Will be 25 on 2025-08-11
            location: 'Test',
            photos: [],
            lastActive: new Date().toISOString(),
            expand: { user: { id: 'userAge', name: 'User Age' } }
          },
        ],
      };
      mockPocketBase.getList.mockResolvedValue(mockProfiles);

      await profileController.searchProfiles(mockReq, mockRes);

      expect(mockRes.json.mock.calls[0][0].items[0].age).toBe(25);
    });

    it('should set isOnline to true if lastActive is within 5 minutes', async () => {
      mockReq.query = {};
      const fiveMinutesAgo = new Date(Date.now() - 4 * 60 * 1000).toISOString(); // 4 minutes ago
      const mockProfiles = {
        page: 1,
        perPage: 10,
        totalItems: 1,
        totalPages: 1,
        items: [
          {
            id: 'profileOnline',
            user: 'userOnline',
            name: 'User Online',
            birthdate: '1990-01-01T00:00:00.000Z',
            location: 'Test',
            photos: [],
            lastActive: fiveMinutesAgo,
            expand: { user: { id: 'userOnline', name: 'User Online' } }
          },
        ],
      };
      mockPocketBase.getList.mockResolvedValue(mockProfiles);

      await profileController.searchProfiles(mockReq, mockRes);

      expect(mockRes.json.mock.calls[0][0].items[0].isOnline).toBe(true);
    });

    it('should set isOnline to false if lastActive is older than 5 minutes', async () => {
      mockReq.query = {};
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 minutes ago
      const mockProfiles = {
        page: 1,
        perPage: 10,
        totalItems: 1,
        totalPages: 1,
        items: [
          {
            id: 'profileOffline',
            user: 'userOffline',
            name: 'User Offline',
            birthdate: '1990-01-01T00:00:00.000Z',
            location: 'Test',
            photos: [],
            lastActive: tenMinutesAgo,
            expand: { user: { id: 'userOffline', name: 'User Offline' } }
          },
        ],
      };
      mockPocketBase.getList.mockResolvedValue(mockProfiles);

      await profileController.searchProfiles(mockReq, mockRes);

      expect(mockRes.json.mock.calls[0][0].items[0].isOnline).toBe(false);
    });

    it('should set isOnline to false if lastActive is null', async () => {
      mockReq.query = {};
      const mockProfiles = {
        page: 1,
        perPage: 10,
        totalItems: 1,
        totalPages: 1,
        items: [
          {
            id: 'profileNoActive',
            user: 'userNoActive',
            name: 'User No Active',
            birthdate: '1990-01-01T00:00:00.000Z',
            location: 'Test',
            photos: [],
            lastActive: null,
            expand: { user: { id: 'userNoActive', name: 'User No Active' } }
          },
        ],
      };
      mockPocketBase.getList.mockResolvedValue(mockProfiles);

      await profileController.searchProfiles(mockReq, mockRes);

      expect(mockRes.json.mock.calls[0][0].items[0].isOnline).toBe(false);
    });

    it('should handle empty interests query param', async () => {
      mockReq.query = { interests: '' };
      const mockProfiles = {
        page: 1,
        perPage: 10,
        totalItems: 1,
        totalPages: 1,
        items: [
          {
            id: 'profileEmptyInterests',
            user: 'userEmptyInterests',
            name: 'User Empty Interests',
            birthdate: '1990-01-01T00:00:00.000Z',
            location: 'Test',
            photos: [],
            lastActive: new Date().toISOString(),
            expand: { user: { id: 'userEmptyInterests', name: 'User Empty Interests' } }
          },
        ],
      };
      mockPocketBase.getList.mockResolvedValue(mockProfiles);

      await profileController.searchProfiles(mockReq, mockRes);

      expect(mockPocketBase.getList).toHaveBeenCalledWith(1, 10, expect.objectContaining({
        filter: '', // No interest filter should be applied
      }));
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({ _id: 'profileEmptyInterests' }),
        ]),
      }));
    });
  });
});
