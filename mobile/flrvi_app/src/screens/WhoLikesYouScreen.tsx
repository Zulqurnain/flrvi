import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import Header from '../components/Header';
import ProfileCard from '../components/ProfileCard';

const WhoLikesYouScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { profile, status } = useSelector((state: RootState) => state.user);
  const isPremium = profile?.isPremium || false;

  // Mock data for users who liked the current user
  const likedByUsers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      age: 28,
      location: 'Bangkok',
      photos: ['https://via.placeholder.com/300x400/FFB6C1/000000?text=Sarah'],
      isOnline: true,
    },
    {
      id: '2',
      name: 'Emma Wilson',
      age: 25,
      location: 'Phuket',
      photos: ['https://via.placeholder.com/300x400/87CEEB/000000?text=Emma'],
      isOnline: false,
    },
    {
      id: '3',
      name: 'Lisa Chen',
      age: 30,
      location: 'Chiang Mai',
      photos: ['https://via.placeholder.com/300x400/98FB98/000000?text=Lisa'],
      isOnline: true,
    },
  ];

  const handleUpgrade = () => {
    navigation.navigate('Subscription');
  };

  const renderProfile = ({ item }: any) => (
    <ProfileCard
      profile={item}
      onPress={() => navigation.navigate('Profile', { userId: item.id })}
    />
  );

  if (!isPremium) {
    return (
      <View style={styles.container}>
        <Header 
          title="Who Likes You" 
          onBack={() => navigation.goBack()} 
        />
        <View style={styles.upgradeContainer}>
          <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
          <Text style={styles.upgradeText}>
            See who likes you and unlock all premium features!
          </Text>
          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Who Likes You" 
        onBack={() => navigation.goBack()} 
      />
      <FlatList
        data={likedByUsers}
        renderItem={renderProfile}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  upgradeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F5F5F5',
  },
  upgradeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  upgradeText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  upgradeButton: {
    backgroundColor: '#E91E63',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: '80%',
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default WhoLikesYouScreen;