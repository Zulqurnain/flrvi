// Mock ClientResponseError for PocketBase, defined outside the mock factory for accessibility
class MockClientResponseError extends Error {
  constructor(status, data) {
    super(data.message || 'Client Response Error');
    this.response = { status: status };
    this.data = data;
    this.isAbort = false;
    this.originalError = null;
    this.name = 'ClientResponseError';
    this.status = status;
  }
}

const paymentController = require('../paymentController');
const omise = require('omise');
const SubscriptionModel = require('../../models/Subscription'); // Import the Subscription model

// Mock Omise
jest.mock('omise', () => {
  const mockCustomers = {
    create: jest.fn(),
    createSubscription: jest.fn(),
    cancelSubscription: jest.fn(),
  };
  const mockCharges = {
    create: jest.fn(),
  };
  return jest.fn(() => ({
    customers: mockCustomers,
    charges: mockCharges,
  }));
});

// Mock PocketBase module
const mockSubscriptionsCreate = jest.fn();
const mockSubscriptionsGetFirstListItem = jest.fn();
const mockSubscriptionsUpdate = jest.fn();
const mockUsersUpdate = jest.fn();
const mockPaymentsGetFullList = jest.fn();
const mockPaymentsCreate = jest.fn();
const mockProfilesGetFirstListItem = jest.fn();
const mockProfilesUpdate = jest.fn();

jest.mock('pocketbase/cjs', () => {
  return {
    ClientResponseError: MockClientResponseError,
  };
});

jest.mock('../../db/pocketbase', () => ({
  collection: jest.fn((name) => {
    if (name === 'subscriptions') {
      return {
        create: mockSubscriptionsCreate,
        getFirstListItem: mockSubscriptionsGetFirstListItem,
        update: mockSubscriptionsUpdate,
      };
    }
    if (name === 'users') {
      return {
        update: mockUsersUpdate,
      };
    }
    if (name === 'payments') {
      return {
        getFullList: mockPaymentsGetFullList,
        create: mockPaymentsCreate,
      };
    }
    if (name === 'profiles') {
      return {
        getFirstListItem: mockProfilesGetFirstListItem,
        update: mockProfilesUpdate,
      };
    }
    return {};
  }),
}));

describe('Payment Controller', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks before each test
    omise.mockClear();
    omise().customers.create.mockReset();
    omise().customers.createSubscription.mockReset();
    omise().customers.cancelSubscription.mockReset();
    omise().charges.create.mockReset();

    mockSubscriptionsCreate.mockReset();
    mockSubscriptionsGetFirstListItem.mockReset();
    mockSubscriptionsUpdate.mockReset();
    mockUsersUpdate.mockReset();
    mockPaymentsGetFullList.mockReset();
    mockPaymentsCreate.mockReset();
    mockProfilesGetFirstListItem.mockReset();
    mockProfilesUpdate.mockReset();

    // No need to call setPb here, as the module itself is mocked
    // setPb(mockPocketBase); 

    req = {
      body: {},
      user: { id: 'user123' },
      t: jest.fn((key) => key), // Mock translation function
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(), // Allows chaining .status().json()
      send: jest.fn(),
    };
    next = jest.fn();
  });

  describe('createSubscription', () => {
    it('should create a subscription successfully', async () => {
      const mockCustomer = { id: 'cus_test123' };
      const mockOmiseSubscription = {
        id: 'sub_test456',
        plan: 'premium_monthly',
        status: 'active',
      };

      omise().customers.create.mockResolvedValue(mockCustomer);
      omise().customers.createSubscription.mockResolvedValue(mockOmiseSubscription);
      mockSubscriptionsCreate.mockResolvedValue({
        id: 'pb_sub_id',
        user: req.user.id,
        plan: 'premium_monthly',
        omiseCustomerId: mockCustomer.id,
        omiseSubscriptionId: mockOmiseSubscription.id,
        status: 'active',
      });
      mockUsersUpdate.mockResolvedValue({});

      req.body = {
        email: 'test@example.com',
        plan: 'premium_monthly',
        source: 'tok_test',
      };

      await paymentController.createSubscription(req, res);

      expect(omise().customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        description: `Customer for test@example.com`,
        card: 'tok_test',
      });
      expect(omise().customers.createSubscription).toHaveBeenCalledWith(
        mockCustomer.id,
        { plan: 'premium_monthly' }
      );
      expect(mockSubscriptionsCreate).toHaveBeenCalledWith({
        user: req.user.id,
        plan: 'premium_monthly',
        omiseCustomerId: mockCustomer.id,
        omiseSubscriptionId: mockOmiseSubscription.id,
        status: 'active',
      });
      expect(mockUsersUpdate).toHaveBeenCalledWith(
        req.user.id,
        { isPremium: true }
      );
      expect(res.json).toHaveBeenCalledWith({
        ...mockOmiseSubscription,
        message: 'subscription_created',
      });
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle Omise customer creation failure', async () => {
      const omiseError = new Error('Omise customer error');
      omise().customers.create.mockRejectedValue(omiseError);

      req.body = {
        email: 'test@example.com',
        plan: 'premium_monthly',
        source: 'tok_test',
      };

      await paymentController.createSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'subscription_creation_failed' });
      expect(mockSubscriptionsCreate).not.toHaveBeenCalled();
      expect(mockUsersUpdate).not.toHaveBeenCalled();
    });

    it('should handle Omise subscription creation failure', async () => {
      const omiseError = new Error('Omise subscription error');
      omise().customers.create.mockResolvedValue({ id: 'cus_test123' });
      omise().customers.createSubscription.mockRejectedValue(omiseError);

      req.body = {
        email: 'test@example.com',
        plan: 'premium_monthly',
        source: 'tok_test',
      };

      await paymentController.createSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'subscription_creation_failed' });
      expect(mockSubscriptionsCreate).not.toHaveBeenCalled();
      expect(mockUsersUpdate).not.toHaveBeenCalled();
    });

    it('should handle PocketBase subscription creation failure', async () => {
      const pbError = new Error('PocketBase subscription error');
      omise().customers.create.mockResolvedValue({ id: 'cus_test123' });
      omise().customers.createSubscription.mockResolvedValue({
        id: 'sub_test456',
        plan: 'premium_monthly',
        status: 'active',
      });
      mockSubscriptionsCreate.mockRejectedValue(pbError);

      req.body = {
        email: 'test@example.com',
        plan: 'premium_monthly',
        source: 'tok_test',
      };

      await paymentController.createSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'subscription_creation_failed' });
      expect(mockUsersUpdate).not.toHaveBeenCalled();
    });

    it('should handle PocketBase user update failure', async () => {
      const pbError = new Error('PocketBase user update error');
      omise().customers.create.mockResolvedValue({ id: 'cus_test123' });
      omise().customers.createSubscription.mockResolvedValue({
        id: 'sub_test456',
        plan: 'premium_monthly',
        status: 'active',
      });
      mockSubscriptionsCreate.mockResolvedValue({});
      mockUsersUpdate.mockRejectedValue(pbError);

      req.body = {
        email: 'test@example.com',
        plan: 'premium_monthly',
        source: 'tok_test',
      };

      await paymentController.createSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'subscription_creation_failed' });
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel an active subscription successfully', async () => {
      const mockSubscription = {
        id: 'pb_sub_id',
        user: req.user.id,
        plan: 'premium_monthly',
        omiseCustomerId: 'cus_test123',
        omiseSubscriptionId: 'sub_test456',
        status: 'active',
      };
      const mockCanceledOmiseSubscription = {
        id: 'sub_test456',
        ended_at: new Date().toISOString(),
      };

      mockSubscriptionsGetFirstListItem.mockResolvedValue(mockSubscription);
      omise().customers.cancelSubscription.mockResolvedValue(mockCanceledOmiseSubscription);
      mockSubscriptionsUpdate.mockResolvedValue({});
      mockUsersUpdate.mockResolvedValue({});

      await paymentController.cancelSubscription(req, res);

      expect(mockSubscriptionsGetFirstListItem).toHaveBeenCalledWith(
        `user="${req.user.id}" && status="active"`
      );
      expect(omise().customers.cancelSubscription).toHaveBeenCalledWith(
        mockSubscription.omiseCustomerId,
        mockSubscription.omiseSubscriptionId
      );
      expect(mockSubscriptionsUpdate).toHaveBeenCalledWith(
        mockSubscription.id,
        {
          status: 'canceled',
          endDate: mockCanceledOmiseSubscription.ended_at,
        }
      );
      expect(mockUsersUpdate).toHaveBeenCalledWith(
        req.user.id,
        { isPremium: false }
      );
      expect(res.json).toHaveBeenCalledWith({ message: 'subscription_canceled' });
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 404 if no active subscription found in PocketBase', async () => {
      mockSubscriptionsGetFirstListItem.mockRejectedValue(
        new MockClientResponseError(404, { code: 404, message: 'Subscription Not Found' })
      );

      await paymentController.cancelSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'no_active_subscription' });
      expect(omise().customers.cancelSubscription).not.toHaveBeenCalled();
      expect(mockSubscriptionsUpdate).not.toHaveBeenCalled();
      expect(mockUsersUpdate).not.toHaveBeenCalled();
    });

    it('should handle Omise cancellation failure', async () => {
      // Mock a generic error to ensure it hits the 500 status
      const omiseError = new Error('Omise cancellation error');
      const mockSubscription = {
        id: 'pb_sub_id',
        user: req.user.id,
        plan: 'premium_monthly',
        omiseCustomerId: 'cus_test123',
        omiseSubscriptionId: 'sub_test456',
        status: 'active',
      };

      mockSubscriptionsGetFirstListItem.mockResolvedValue(mockSubscription);
      omise().customers.cancelSubscription.mockRejectedValue(omiseError);

      await paymentController.cancelSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'subscription_cancellation_failed' });
      expect(mockSubscriptionsUpdate).not.toHaveBeenCalled();
      expect(mockUsersUpdate).not.toHaveBeenCalled();
    });

    it('should handle PocketBase subscription update failure during cancellation', async () => {
      // Mock a generic error to ensure it hits the 500 status
      const pbError = new Error('PocketBase update error');
      const mockSubscription = {
        id: 'pb_sub_id',
        user: req.user.id,
        plan: 'premium_monthly',
        omiseCustomerId: 'cus_test123',
        omiseSubscriptionId: 'sub_test456',
        status: 'active',
      };
      const mockCanceledOmiseSubscription = {
        id: 'sub_test456',
        ended_at: new Date().toISOString(),
      };

      mockSubscriptionsGetFirstListItem.mockResolvedValue(mockSubscription);
      omise().customers.cancelSubscription.mockResolvedValue(mockCanceledOmiseSubscription);
      mockSubscriptionsUpdate.mockRejectedValue(pbError);

      await paymentController.cancelSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'subscription_cancellation_failed' });
      expect(mockUsersUpdate).not.toHaveBeenCalled();
    });

    it('should handle PocketBase user update failure during cancellation', async () => {
      // Mock a generic error to ensure it hits the 500 status
      const pbError = new Error('PocketBase user update error');
      const mockSubscription = {
        id: 'pb_sub_id',
        user: req.user.id,
        plan: 'premium_monthly',
        omiseCustomerId: 'cus_test123',
        omiseSubscriptionId: 'sub_test456',
        status: 'active',
      };
      const mockCanceledOmiseSubscription = {
        id: 'sub_test456',
        ended_at: new Date().toISOString(),
      };

      mockSubscriptionsGetFirstListItem.mockResolvedValue(mockSubscription);
      omise().customers.cancelSubscription.mockResolvedValue(mockCanceledOmiseSubscription);
      mockSubscriptionsUpdate.mockResolvedValue({});
      mockUsersUpdate.mockRejectedValue(pbError);

      await paymentController.cancelSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'subscription_cancellation_failed' });
    });
  });

  describe('getPaymentHistory', () => {
    it('should return payment history successfully', async () => {
      const mockPayments = [
        { id: 'pay1', description: 'Premium Plan', date: '2023-01-01', amount: 1000 },
        { id: 'pay2', description: 'Boost Feature', date: '2023-01-15', amount: 500 },
      ];

      mockPaymentsGetFullList.mockResolvedValue(mockPayments);

      await paymentController.getPaymentHistory(req, res);

      expect(mockPaymentsGetFullList).toHaveBeenCalledWith({
        filter: `user="${req.user.id}"`,
        sort: '-date',
      });
      expect(res.json).toHaveBeenCalledWith([
        { id: 'pay1', description: 'Premium Plan', date: '2023-01-01', amount: 1000 },
        { id: 'pay2', description: 'Boost Feature', date: '2023-01-15', amount: 500 },
      ]);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return empty array if no payment history', async () => {
      mockPaymentsGetFullList.mockResolvedValue([]);

      await paymentController.getPaymentHistory(req, res);

      expect(mockPaymentsGetFullList).toHaveBeenCalledWith({
        filter: `user="${req.user.id}"`,
        sort: '-date',
      });
      expect(res.json).toHaveBeenCalledWith([]);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle PocketBase payment history retrieval failure', async () => {
      const pbError = new Error('PocketBase payment history error');
      mockPaymentsGetFullList.mockRejectedValue(pbError);

      await paymentController.getPaymentHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('server_error');
    });
  });

  describe('purchaseConsumable', () => {
    it('should purchase a consumable successfully', async () => {
      const mockCharge = { 
        id: 'chrg_test789', 
        status: 'successful',
        amount: 5000,
        currency: 'THB'
      };
      const mockPayment = { id: 'pay_test789' };
      const mockProfile = { id: 'profile123' };

      req.body = {
        productId: 'boost_50_thb',
        amount: 50
      };

      omise().charges.create.mockResolvedValue(mockCharge);
      mockPaymentsCreate.mockResolvedValue(mockPayment);
      mockProfilesGetFirstListItem.mockResolvedValue(mockProfile);
      mockProfilesUpdate.mockResolvedValue({});

      await paymentController.purchaseConsumable(req, res);

      expect(omise().charges.create).toHaveBeenCalledWith({
        amount: 5000,
        currency: 'THB',
        description: 'Purchase of boost_50_thb',
        metadata: {
          userId: req.user.id,
          productId: 'boost_50_thb',
          type: 'consumable'
        }
      });
      
      expect(mockPaymentsCreate).toHaveBeenCalledWith({
        user: req.user.id,
        amount: 50,
        currency: 'THB',
        productId: 'boost_50_thb',
        chargeId: 'chrg_test789',
        status: 'successful',
        date: expect.any(Date),
        type: 'consumable'
      });

      expect(mockProfilesGetFirstListItem).toHaveBeenCalledWith(`user="${req.user.id}"`);
      expect(mockProfilesUpdate).toHaveBeenCalledWith('profile123', {
        boostExpiresAt: expect.any(Date)
      });

      expect(res.json).toHaveBeenCalledWith({
        ...mockCharge,
        paymentId: 'pay_test789',
        message: 'consumable_purchased'
      });
    });

    it('should handle Omise charge creation failure', async () => {
      const omiseError = new Error('Omise charge error');
      req.body = {
        productId: 'boost_50_thb',
        amount: 50
      };

      omise().charges.create.mockRejectedValue(omiseError);

      await paymentController.purchaseConsumable(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'consumable_purchase_failed' });
    });

    it('should handle PocketBase payment creation failure', async () => {
      const mockCharge = { 
        id: 'chrg_test789', 
        status: 'successful'
      };
      const pbError = new Error('PocketBase payment error');

      req.body = {
        productId: 'boost_50_thb',
        amount: 50
      };

      omise().charges.create.mockResolvedValue(mockCharge);
      mockPaymentsCreate.mockRejectedValue(pbError);

      await paymentController.purchaseConsumable(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'consumable_purchase_failed' });
    });

    it('should handle profile not found when updating boost', async () => {
      const mockCharge = { 
        id: 'chrg_test789', 
        status: 'successful'
      };
      const mockPayment = { id: 'pay_test789' };

      req.body = {
        productId: 'boost_50_thb',
        amount: 50
      };

      omise().charges.create.mockResolvedValue(mockCharge);
      mockPaymentsCreate.mockResolvedValue(mockPayment);
      mockProfilesGetFirstListItem.mockResolvedValue(null);

      await paymentController.purchaseConsumable(req, res);

      expect(res.json).toHaveBeenCalledWith({
        ...mockCharge,
        paymentId: 'pay_test789',
        message: 'consumable_purchased'
      });
    });
  });
});