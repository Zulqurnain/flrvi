import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchProfiles } from '../store/userSlice';

const FilterModal = ({ visible, onClose, onApply }: { visible: boolean; onClose: () => void; onApply: (filters: any) => void }) => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.user.profile);
  
  const [ageRange, setAgeRange] = useState<[number, number]>([20, 45]);
  const [gender, setGender] = useState<string>('Any');
  const [location, setLocation] = useState<string>('');
  const [interests, setInterests] = useState<string[]>([]);

  const interestsOptions = ['Travel', 'Cooking', 'Movies', 'Sports', 'Music', 'Reading', 'Fitness', 'Art'];

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  const applyFilters = () => {
    const filters = {
      age_min: ageRange[0],
      age_max: ageRange[1],
      gender: gender !== 'Any' ? gender : undefined,
      location: location || undefined,
      interests: interests.length > 0 ? interests.join(',') : undefined
    };
    
    onApply(filters);
    onClose();
  };

  const resetFilters = () => {
    setAgeRange([20, 45]);
    setGender('Any');
    setLocation('');
    setInterests([]);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter Profiles</Text>
            <TouchableOpacity onPress={resetFilters}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Age Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Age Range</Text>
              <View style={styles.ageContainer}>
                <Text style={styles.ageText}>{ageRange[0]} - {ageRange[1]} years old</Text>
              </View>
              {/* In a real app, you would add slider components here */}
            </View>

            {/* Gender */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Show Me</Text>
              <View style={styles.genderContainer}>
                {['Men', 'Women', 'Everyone'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.genderButton,
                      gender === option && styles.genderButtonSelected
                    ]}
                    onPress={() => setGender(option)}
                  >
                    <Text style={[
                      styles.genderButtonText,
                      gender === option && styles.genderButtonTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.input}>{location || 'Enter location'}</Text>
              </View>
            </View>

            {/* Interests */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.interestsContainer}>
                {interestsOptions.map((interest) => (
                  <TouchableOpacity
                    key={interest}
                    style={[
                      styles.interestButton,
                      interests.includes(interest) && styles.interestButtonSelected
                    ]}
                    onPress={() => toggleInterest(interest)}
                  >
                    <Text style={[
                      styles.interestButtonText,
                      interests.includes(interest) && styles.interestButtonTextSelected
                    ]}>
                      {interest}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  resetText: {
    fontSize: 16,
    color: '#E91E63',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  ageContainer: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 12,
  },
  ageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: '#E91E63',
  },
  genderButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  genderButtonTextSelected: {
    color: 'white',
  },
  inputContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
  },
  input: {
    fontSize: 16,
    color: '#666',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 5,
  },
  interestButtonSelected: {
    backgroundColor: '#E91E63',
  },
  interestButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  interestButtonTextSelected: {
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#E91E63',
    marginLeft: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default FilterModal;