import analytics from '@react-native-firebase/analytics';

export const AnalyticsService = {
  // Log screen views
  logScreenView: (screenName: string) => {
    analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  },
  
  // User authentication events
  logRegistrationSuccess: (method: string) => {
    analytics().logEvent('registration_success', { method });
  },
  
  logLoginSuccess: (method: string) => {
    analytics().logEvent('login_success', { method });
  },
  
  // Core engagement events
  logProfileLike: (sourceScreen: string) => {
    analytics().logEvent('profile_like', { source_screen: sourceScreen });
  },
  
  logMatchCreated: () => {
    analytics().logEvent('match_created');
  },
  
  logMessageSent: (messageType: 'text' | 'voice_note', isFirstMessage: boolean) => {
    analytics().logEvent('message_sent', { 
      message_type: messageType, 
      is_first_message: isFirstMessage 
    });
  },
  
  // Monetization events
  logSubscriptionPurchaseSuccess: (planId: string, price: number, currency: string) => {
    analytics().logEvent('subscription_purchase_success', { 
      plan_id: planId, 
      price, 
      currency 
    });
  },
  
  logBoostPurchaseSuccess: (productId: string, price: number, currency: string) => {
    analytics().logEvent('boost_purchase_success', { 
      product_id: productId, 
      price, 
      currency 
    });
  },
  
  // Feature usage events
  logSearchFiltersApplied: (filtersUsed: string) => {
    analytics().logEvent('search_filters_applied', { 
      filters_used: filtersUsed 
    });
  },
  
  logProfileVerificationStarted: () => {
    analytics().logEvent('profile_verification_started');
  },
  
  // Set user properties
  setUserProperties: (userId: string, isPremium: boolean, gender: string, age: number, location: string) => {
    analytics().setUserId(userId);
    analytics().setUserProperty('is_premium', String(isPremium));
    analytics().setUserProperty('gender', gender);
    analytics().setUserProperty('age', String(age));
    analytics().setUserProperty('location', location);
  },
};
