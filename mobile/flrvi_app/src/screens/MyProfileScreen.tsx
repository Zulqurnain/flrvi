import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUserProfile } from '../store/userSlice';
import { AppDispatch, RootState } from '../store/store';
import Header from '../components/Header';

const { width } = Dimensions.get('window');

const MyProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, status } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(fetchCurrentUserProfile());
  }, [dispatch]);

  if (status === 'loading' || !profile) {
    return <ActivityIndicator size="large" color="#E91E63" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Header
        title="My Profile"
        leftAction={{
          icon: 'menu',
          action: () => navigation.openDrawer(),
        }}
        rightAction={{
          icon: 'edit',
          action: () => navigation.navigate('EditProfileScreen'),
        }}
      />
      <ScrollView horizontal pagingEnabled style={styles.carousel}>
        {profile.photos.map((photo, index) => (
          <Image key={index} source={{ uri: photo }} style={styles.image} />
        ))}
      </ScrollView>
      <View style={styles.header}>
        <Text style={styles.name}>{profile.user.name}</Text>
        <Text style={styles.subheading}>{profile.age}, {profile.location}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Me</Text>
        <Text style={styles.bio}>{profile.bio}</Text>
      </View>
      <View style={styles.boostButtonContainer}>
        <TouchableOpacity
          style={styles.boostButton}
          onPress={() => navigation.navigate('BoostPurchase')}
        >
          <Text style={styles.boostButtonText}>Boost Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  carousel: {
    height: width,
  },
  image: {
    width: width,
    height: width,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  subheading: {
    fontSize: 18,
    color: '#757575',
    marginTop: 4,
  },
  section: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
  },
  boostButtonContainer: {
    padding: 20,
  },
  boostButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  boostButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MyProfileScreen;
