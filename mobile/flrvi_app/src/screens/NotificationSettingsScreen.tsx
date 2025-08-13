import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateNotificationSetting } from '../store/userSlice';

const NotificationSettingsScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const notificationSettings = useSelector((state: any) => state.user.profile?.notificationSettings || {});
  
  const [newMessages, setNewMessages] = useState(notificationSettings.newMessages !== false);
  const [newLikes, setNewLikes] = useState(notificationSettings.newLikes !== false);
  const [appUpdates, setAppUpdates] = useState(notificationSettings.appUpdates !== false);

  useEffect(() => {
    // Initialize with current settings
    setNewMessages(notificationSettings.newMessages !== false);
    setNewLikes(notificationSettings.newLikes !== false);
    setAppUpdates(notificationSettings.appUpdates !== false);
  }, [notificationSettings]);

  const handleSettingChange = async (setting: string, value: boolean) => {
    try {
      await dispatch(updateNotificationSetting({ [setting]: value }) as any).unwrap();
    } catch (error) {
      console.error(`Failed to update ${setting} setting:`, error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} /> {/* Spacer for alignment */}
      </View>

      <View style={styles.settingsContainer}>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>New Messages</Text>
          <Switch
            value={newMessages}
            onValueChange={(value) => {
              setNewMessages(value);
              handleSettingChange('newMessages', value);
            }}
            trackColor={{ false: '#767577', true: '#E91E63' }}
            thumbColor={newMessages ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>New Likes</Text>
          <Switch
            value={newLikes}
            onValueChange={(value) => {
              setNewLikes(value);
              handleSettingChange('newLikes', value);
            }}
            trackColor={{ false: '#767577', true: '#E91E63' }}
            thumbColor={newLikes ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>App Updates & News</Text>
          <Switch
            value={appUpdates}
            onValueChange={(value) => {
              setAppUpdates(value);
              handleSettingChange('appUpdates', value);
            }}
            trackColor={{ false: '#767577', true: '#E91E63' }}
            thumbColor={appUpdates ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#666',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsContainer: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default NotificationSettingsScreen;