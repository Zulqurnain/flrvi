import { AnalyticsService } from '../analyticsService';
import analytics from '@react-native-firebase/analytics';

// Create a shared mock instance
const mockAnalytics = {
  logScreenView: jest.fn(),
  logEvent: jest.fn(),
  setUserId: jest.fn(),
  setUserProperty: jest.fn(),
};

jest.mock('@react-native-firebase/analytics', () => ({
  __esModule: true,
  default: jest.fn(() => mockAnalytics),
}));

describe('AnalyticsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('logScreenView', () => {
    it('logs screen view with correct parameters', () => {
      AnalyticsService.logScreenView('HomeScreen');
      expect(analytics().logScreenView).toHaveBeenCalledWith({
        screen_name: 'HomeScreen',
        screen_class: 'HomeScreen',
      });
    });
  });

  describe('logRegistrationSuccess', () => {
    it('logs registration success event with method', () => {
      AnalyticsService.logRegistrationSuccess('email');
      expect(analytics().logEvent).toHaveBeenCalledWith('registration_success', { method: 'email' });
    });
  });

  describe('logLoginSuccess', () => {
    it('logs login success event with method', () => {
      AnalyticsService.logLoginSuccess('facebook');
      expect(analytics().logEvent).toHaveBeenCalledWith('login_success', { method: 'facebook' });
    });
  });

  describe('logProfileLike', () => {
    it('logs profile like event with source screen', () => {
      AnalyticsService.logProfileLike('DiscoverScreen');
      expect(analytics().logEvent).toHaveBeenCalledWith('profile_like', { source_screen: 'DiscoverScreen' });
    });
  });

  describe('logMatchCreated', () => {
    it('logs match created event', () => {
      AnalyticsService.logMatchCreated();
      expect(analytics().logEvent).toHaveBeenCalledWith('match_created');
    });
  });

  describe('logMessageSent', () => {
    it('logs message sent event with parameters', () => {
      AnalyticsService.logMessageSent('text', true);
      expect(analytics().logEvent).toHaveBeenCalledWith('message_sent', { 
        message_type: 'text', 
        is_first_message: true 
      });
    });
  });

  describe('logSubscriptionPurchaseSuccess', () => {
    it('logs subscription purchase with details', () => {
      AnalyticsService.logSubscriptionPurchaseSuccess('premium_monthly', 299, 'THB');
      expect(analytics().logEvent).toHaveBeenCalledWith('subscription_purchase_success', { 
        plan_id: 'premium_monthly', 
        price: 299, 
        currency: 'THB' 
      });
    });
  });

  describe('logBoostPurchaseSuccess', () => {
    it('logs boost purchase with details', () => {
      AnalyticsService.logBoostPurchaseSuccess('boost_50', 50, 'THB');
      expect(analytics().logEvent).toHaveBeenCalledWith('boost_purchase_success', { 
        product_id: 'boost_50', 
        price: 50, 
        currency: 'THB' 
      });
    });
  });

  describe('logSearchFiltersApplied', () => {
    it('logs search filters applied event', () => {
      AnalyticsService.logSearchFiltersApplied('age,gender,location');
      expect(analytics().logEvent).toHaveBeenCalledWith('search_filters_applied', { 
        filters_used: 'age,gender,location' 
      });
    });
  });

  describe('logProfileVerificationStarted', () => {
    it('logs profile verification started event', () => {
      AnalyticsService.logProfileVerificationStarted();
      expect(analytics().logEvent).toHaveBeenCalledWith('profile_verification_started');
    });
  });

  describe('setUserProperties', () => {
    it('sets user properties correctly', () => {
      AnalyticsService.setUserProperties('user123', true, 'female', 28, 'Bangkok');
      
      expect(analytics().setUserId).toHaveBeenCalledWith('user123');
      expect(analytics().setUserProperty).toHaveBeenCalledWith('is_premium', 'true');
      expect(analytics().setUserProperty).toHaveBeenCalledWith('gender', 'female');
      expect(analytics().setUserProperty).toHaveBeenCalledWith('age', '28');
      expect(analytics().setUserProperty).toHaveBeenCalledWith('location', 'Bangkok');
    });
  });
});
