import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { subscribeUser, selectSubscriptionStatus, selectUserRegistrationStatus } from '../store/userSlice';
import Header from '../components/Header';

const SubscriptionScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const isSubscribed = useSelector(selectSubscriptionStatus);
  const subscriptionStatus = useSelector(selectUserRegistrationStatus);
  const userProfile = useSelector((state: RootState) => state.user.profile);

  const handleSubscribe = async () => {
    if (!userProfile?.email) {
      Alert.alert('Error', 'Please complete your profile first');
      return;
    }

    try {
      // In a real implementation, you would integrate with Omise SDK to get a source token
      // For now, we'll use a placeholder
      const subscriptionData = {
        email: userProfile.email,
        plan: 'monthly_299',
        source: 'placeholder_source_token' // This would come from Omise SDK
      };

      // @ts-ignore
      const result = await dispatch(subscribeUser(subscriptionData)).unwrap();
      Alert.alert('Success', 'You are now a premium member!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Subscription Failed', 'Failed to process subscription. Please try again.');
    }
  };

  const renderFeatureItem = (icon: string, text: string) => (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Subscription"
        leftAction={{
          icon: 'arrow-back',
          action: () => navigation.goBack(),
        }}
        rightAction={undefined}
      />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>FLRVI Premium</Text>
        
        <View style={styles.featuresContainer}>
          {renderFeatureItem('💬', 'Unlimited Messaging')}
          {renderFeatureItem('🔍', 'Advanced Search Filters')}
          {renderFeatureItem('❤️', 'See Who Likes You')}
          {renderFeatureItem('👁️', 'Read Receipts')}
          {renderFeatureItem('🚫', 'Ad-Free Experience')}
        </View>

        <View style={styles.pricingBox}>
          <Text style={styles.priceText}>299 THB / month</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Text style={styles.subscribeButton} onPress={handleSubscribe}>
            Subscribe Now
          </Text>
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Premium Benefits:</Text>
          <Text style={styles.benefitText}>• Send unlimited messages to anyone</Text>
          <Text style={styles.benefitText}>• Filter matches by location, interests, and more</Text>
          <Text style={styles.benefitText}>• See who has liked your profile</Text>
          <Text style={styles.benefitText}>• Know when your messages have been read</Text>
          <Text style={styles.benefitText}>• Enjoy the app without any advertisements</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333333',
    marginBottom: 32,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  pricingBox: {
    backgroundColor: '#E91E63',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  subscribeButton: {
    backgroundColor: '#E91E63',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    textAlign: 'center',
    width: '100%',
  },
  benefitsContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default SubscriptionScreen;