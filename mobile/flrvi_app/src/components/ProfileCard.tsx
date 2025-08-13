import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const ProfileCard = ({ userProfile, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(userProfile.id)} style={styles.card}>
      <Image source={{ uri: userProfile.primaryPhoto }} style={styles.image} />
      {userProfile.isOnline && <View style={styles.onlineIndicator} />}
      <View style={styles.footer}>
        <Text style={styles.name}>{userProfile.name}, {userProfile.age}</Text>
        <Text style={styles.location}>{userProfile.location}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  image: {
    aspectRatio: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  onlineIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'green',
  },
  footer: {
    padding: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 14,
    color: 'gray',
  },
});

export default ProfileCard;
