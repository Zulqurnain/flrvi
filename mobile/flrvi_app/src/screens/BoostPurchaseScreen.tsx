import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { purchaseBoost, selectBoostPurchaseStatus } from '../store/userSlice';

const BoostPurchaseScreen = ({ navigation, route }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const boostStatus = useSelector(selectBoostPurchaseStatus);

  const handlePurchaseBoost = async () => {
    try {
      const purchaseData = {
        productId: 'boost_50_thb',
        amount: 50
      };

      // @ts-ignore
      const result = await dispatch(purchaseBoost(purchaseData)).unwrap();
      Alert.alert('Success', 'Boost purchased successfully!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Purchase Failed', error?.message || 'Failed to purchase boost. Please try again.');
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Boost Your Profile</Text>
          <Text style={styles.description}>
            Get seen by more people in your area for 30 minutes.
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>50 THB</Text>
          </View>
          
          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={handlePurchaseBoost}
          >
            <Text style={styles.purchaseButtonText}>Purchase Boost</Text>
          </TouchableOpacity>
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
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    color: '#666',
    lineHeight: 22,
  },
  priceContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  purchaseButton: {
    backgroundColor: '#E91E63',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: '100%',
  },
  purchaseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default BoostPurchaseScreen;