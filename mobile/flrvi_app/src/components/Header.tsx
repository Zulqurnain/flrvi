import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ title, leftAction, rightAction }) => {
  return (
    <View style={styles.container}>
      <View style={styles.actionContainer}>
        {leftAction && (
          <TouchableOpacity onPress={leftAction.action}>
            <Ionicons name={leftAction.icon} size={24} color="black" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.actionContainer}>
        {rightAction && (
          <TouchableOpacity onPress={rightAction.action}>
            {rightAction.icon ? (
              <Ionicons name={rightAction.icon} size={24} color="black" />
            ) : (
              <Text>{rightAction.label}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    height: 60,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionContainer: {
    width: 50,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Header;
