import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Button, Image, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../store/userSlice';
import { AppDispatch, RootState } from '../store/store';
import Header from '../components/Header';
import { launchImageLibrary } from 'react-native-image-picker';

const EditProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.user);
  const [bio, setBio] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio);
      setPhotos(profile.photos);
    }
  }, [profile]);

  const handleSave = () => {
    const profileData = { ...profile, bio, photos };
    dispatch(updateUserProfile(profileData)).then(() => {
      navigation.goBack();
    });
  };

  const handlePhotoUpload = () => {
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 6 }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets) {
        const uris = response.assets.map((asset) => asset.uri).filter((uri): uri is string => !!uri);
        setPhotos(uris);
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Header
        title="Edit Profile"
        leftAction={{ icon: 'back', action: () => navigation.goBack() }}
        rightAction={{ label: 'Save', action: handleSave }}
      />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Photos</Text>
        <Button title="Upload Photos" onPress={handlePhotoUpload} />
        <View style={styles.photoGrid}>
          {photos.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.thumbnail} />
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Me</Text>
        <TextInput
          style={styles.textArea}
          value={bio}
          onChangeText={setBio}
          maxLength={500}
          multiline
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  textArea: {
    height: 150,
    borderColor: '#BDBDBD',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  thumbnail: {
    width: 100,
    height: 100,
    margin: 5,
  },
});

export default EditProfileScreen;
