import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, Image, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { createProfile } from '../store/userSlice';
import { AppDispatch } from '../store/store';
import DatePicker from 'react-native-date-picker';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { launchImageLibrary } from 'react-native-image-picker';

const ProfileCreationWizardScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [birthday, setBirthday] = useState(new Date());
  const [gender, setGender] = useState('Man');
  const [photos, setPhotos] = useState<string[]>([]);
  const dispatch = useDispatch<AppDispatch>();

  const handleNext = () => {
    if (step === 3) {
      if (photos.length === 0) {
        Alert.alert('Validation Error', 'Please upload at least one photo.');
        return;
      }
      const profileData = { birthday, gender, photos };
      dispatch(createProfile(profileData)).then(() => {
        navigation.navigate('HomeScreen');
      });
    } else {
      setStep(step + 1);
    }
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
    <View style={styles.container}>
      {step === 1 && (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Basic Info</Text>
          <Text style={styles.label}>Your Birthday</Text>
          <DatePicker date={birthday} onDateChange={setBirthday} mode="date" />
          <Text style={styles.label}>Your Gender</Text>
          <SegmentedControl
            values={['Man', 'Woman', 'Other']}
            selectedIndex={['Man', 'Woman', 'Other'].indexOf(gender)}
            onChange={(event) => {
              setGender(event.nativeEvent.value);
            }}
          />
        </View>
      )}
      {step === 2 && (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Add Photos</Text>
          <Button title="Upload Photos" onPress={handlePhotoUpload} />
          <View style={styles.photoGrid}>
            {photos.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.thumbnail} />
            ))}
          </View>
        </View>
      )}
      {step === 3 && (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Your Location</Text>
          <Button title="Enable Location Services" onPress={() => Alert.alert('Location', 'Location services enabled.')} />
        </View>
      )}
      <Button title={step === 3 ? 'Finish' : 'Next'} onPress={handleNext} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: '#F5F5F5',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333333',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
    marginTop: 20,
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

export default ProfileCreationWizardScreen;
