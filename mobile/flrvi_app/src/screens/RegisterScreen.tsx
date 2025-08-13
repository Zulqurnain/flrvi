import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, selectUserRegistrationStatus } from '../store/userSlice';
import { AppDispatch } from '../store/store';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const registrationStatus = useSelector(selectUserRegistrationStatus);

  const handleRegister = () => {
    // Basic validation
    if (name.length < 2) {
      Alert.alert('Validation Error', 'Name must be at least 2 characters long.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Validation Error', 'Password must be at least 8 characters long.');
      return;
    }

    dispatch(registerUser({ name, email, password })).then((result) => {
      if (registerUser.fulfilled.match(result)) {
        navigation.navigate('ProfileCreationWizard');
      } else {
        Alert.alert('Registration Failed', 'An error occurred during registration.');
      }
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        accessibilityLabel="Name Input"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        accessibilityLabel="Email Input"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        accessibilityLabel="Password Input"
      />
      <Button
        title="Register"
        onPress={handleRegister}
        color="#E91E63"
        disabled={registrationStatus === 'loading'}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333333',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderColor: '#BDBDBD',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});

export default RegisterScreen;
