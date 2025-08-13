import React from 'react';
import { View, Text, StyleSheet, Button, SectionList } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../store/userSlice';
import { AppDispatch } from '../store/store';

const SettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();

  const sections = [
    {
      title: 'Account',
      data: [
        { label: 'Edit Profile', action: () => navigation.navigate('EditProfile'), style: 'default' },
        { label: 'Manage Subscription', action: () => navigation.navigate('Subscription'), style: 'default' },
      ],
    },
    {
      title: 'App',
      data: [
        { label: 'Notifications', action: () => navigation.navigate('NotificationSettings'), style: 'default' },
        { label: 'Language', action: () => navigation.navigate('LanguageSettings'), style: 'default' },
      ],
    },
    {
      title: 'General',
      data: [
        { label: 'Logout', action: () => dispatch(logout()), style: 'destructive' },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.label + index}
        renderItem={({ item }) => (
          <Button
            title={item.label}
            onPress={item.action}
            color={item.style === 'destructive' ? 'red' : '#007AFF'}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#f2f2f2',
    padding: 10,
  },
});

export default SettingsScreen;
