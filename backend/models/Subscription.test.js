const Subscription = require('./Subscription');
const { getPb } = require('../db/pocketbase');

// Create a single mock object for the collection methods
const mockCollectionMethods = {
  create: jest.fn(),
  getFirstListItem: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getOne: jest.fn(),
};

// Mock PocketBase to return the same mockCollectionMethods instance
jest.mock('../db/pocketbase', () => {
  const mockPbInstance = {
    collection: jest.fn(() => mockCollectionMethods),
  };
  return {
    getPb: jest.fn(() => mockPbInstance),
    setPb: jest.fn(),
  };
});

describe('Subscription Model', () => {
  const COLLECTION_NAME = 'subscriptions';

  const mockSubscriptionData = {
    user: 'user123',
    plan: 'premium_monthly',
    omiseCustomerId: 'omise_cust_123',
    omiseSubscriptionId: 'omise_sub_456',
    status: 'active',
    startDate: new Date(),
  };

  const mockCreatedSubscription = {
    id: 'sub789',
    ...mockSubscriptionData,
    collectionId: 'subscriptions_collection_id',
    collectionName: 'subscriptions',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('collection initialization', () => {
    it('should initialize the collection with "subscriptions" when any static method is called', async () => {
      // Call a static method to trigger the collection initialization
      mockCollectionMethods.create.mockResolvedValue(mockCreatedSubscription);
      await Subscription.create(mockSubscriptionData);
      expect(getPb().collection).toHaveBeenCalledWith(COLLECTION_NAME);
    });
  });

  describe('create', () => {
    it('should create a new subscription', async () => {
      mockCollectionMethods.create.mockResolvedValue(mockCreatedSubscription);

      const subscription = await Subscription.create(mockSubscriptionData);

      expect(mockCollectionMethods.create).toHaveBeenCalledWith(mockSubscriptionData);
      expect(subscription).toEqual(mockCreatedSubscription);
    });

    it('should throw an error if subscription creation fails', async () => {
      const error = new Error('Failed to create subscription');
      mockCollectionMethods.create.mockRejectedValue(error);

      await expect(Subscription.create(mockSubscriptionData)).rejects.toThrow(error);
    });
  });

  describe('findById', () => {
    it('should find a subscription by ID', async () => {
      mockCollectionMethods.getOne.mockResolvedValue(mockCreatedSubscription);

      const subscription = await Subscription.findById(mockCreatedSubscription.id);

      expect(mockCollectionMethods.getOne).toHaveBeenCalledWith(mockCreatedSubscription.id);
      expect(subscription).toEqual(mockCreatedSubscription);
    });

    it('should return null if subscription is not found by ID', async () => {
      mockCollectionMethods.getOne.mockRejectedValue({ status: 404 });

      const subscription = await Subscription.findById('nonexistentId');

      expect(subscription).toBeNull();
    });

    it('should throw an error if finding subscription by ID fails for other reasons', async () => {
      const error = new Error('Database error');
      mockCollectionMethods.getOne.mockRejectedValue(error);

      await expect(Subscription.findById(mockCreatedSubscription.id)).rejects.toThrow(error);
    });
  });

  describe('findByUserId', () => {
    it('should find a subscription by user ID', async () => {
      mockCollectionMethods.getFirstListItem.mockResolvedValue(mockCreatedSubscription);

      const subscription = await Subscription.findByUserId(mockSubscriptionData.user);

      expect(mockCollectionMethods.getFirstListItem).toHaveBeenCalledWith(`user="${mockSubscriptionData.user}"`);
      expect(subscription).toEqual(mockCreatedSubscription);
    });

    it('should return null if subscription is not found by user ID', async () => {
      mockCollectionMethods.getFirstListItem.mockRejectedValue({ status: 404 });

      const subscription = await Subscription.findByUserId('nonexistentUser');

      expect(subscription).toBeNull();
    });

    it('should throw an error if finding subscription by user ID fails for other reasons', async () => {
      const error = new Error('Database error');
      mockCollectionMethods.getFirstListItem.mockRejectedValue(error);

      await expect(Subscription.findByUserId(mockSubscriptionData.user)).rejects.toThrow(error);
    });
  });

  describe('findByOmiseSubscriptionId', () => {
    it('should find a subscription by Omise subscription ID', async () => {
      mockCollectionMethods.getFirstListItem.mockResolvedValue(mockCreatedSubscription);

      const subscription = await Subscription.findByOmiseSubscriptionId(mockSubscriptionData.omiseSubscriptionId);

      expect(mockCollectionMethods.getFirstListItem).toHaveBeenCalledWith(`omiseSubscriptionId="${mockSubscriptionData.omiseSubscriptionId}"`);
      expect(subscription).toEqual(mockCreatedSubscription);
    });

    it('should return null if subscription is not found by Omise subscription ID', async () => {
      mockCollectionMethods.getFirstListItem.mockRejectedValue({ status: 404 });

      const subscription = await Subscription.findByOmiseSubscriptionId('nonexistentOmiseId');

      expect(subscription).toBeNull();
    });

    it('should throw an error if finding subscription by Omise subscription ID fails for other reasons', async () => {
      const error = new Error('Database error');
      mockCollectionMethods.getFirstListItem.mockRejectedValue(error);

      await expect(Subscription.findByOmiseSubscriptionId(mockSubscriptionData.omiseSubscriptionId)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update an existing subscription', async () => {
      const updateData = { status: 'canceled', endDate: new Date() };
      const updatedSubscription = { ...mockCreatedSubscription, ...updateData };
      mockCollectionMethods.update.mockResolvedValue(updatedSubscription);

      const subscription = await Subscription.update(mockCreatedSubscription.id, updateData);

      expect(mockCollectionMethods.update).toHaveBeenCalledWith(mockCreatedSubscription.id, updateData);
      expect(subscription).toEqual(updatedSubscription);
    });

    it('should throw an error if subscription update fails', async () => {
      const error = new Error('Update failed');
      mockCollectionMethods.update.mockRejectedValue(error);

      await expect(Subscription.update(mockCreatedSubscription.id, { status: 'failed' })).rejects.toThrow(error);
    });
  });

  describe('delete', () => {
    it('should delete a subscription by ID', async () => {
      mockCollectionMethods.delete.mockResolvedValue(true);

      const result = await Subscription.delete(mockCreatedSubscription.id);

      expect(mockCollectionMethods.delete).toHaveBeenCalledWith(mockCreatedSubscription.id);
      expect(result).toBe(true);
    });

    it('should throw an error if subscription deletion fails', async () => {
      const error = new Error('Deletion failed');
      mockCollectionMethods.delete.mockRejectedValue(error);

      await expect(Subscription.delete(mockCreatedSubscription.id)).rejects.toThrow(error);
    });
  });
});
