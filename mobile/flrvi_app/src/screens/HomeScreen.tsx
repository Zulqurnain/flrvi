import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfiles } from '../store/userSlice';
import { AppDispatch, RootState } from '../store/store';
import ProfileCard from '../components/ProfileCard';
import Header from '../components/Header';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profiles, status } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProfiles());
    }
  }, [status, dispatch]);

  const handleEndReached = () => {
    if (status !== 'loading') {
      // In a real app, you would dispatch fetchMoreProfiles here
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Discover"
        leftAction={{
          icon: 'menu',
          action: () => navigation.openDrawer(),
        }}
        rightAction={{
          icon: 'filter',
          action: () => navigation.navigate('FilterModal'),
        }}
      />
      {status === 'loading' && profiles.length === 0 ? (
        <ActivityIndicator size="large" color="#E91E63" />
      ) : (
        <FlatList
          data={profiles}
          renderItem={({ item }) => <ProfileCard userProfile={item} onPress={() => navigation.navigate('ProfileScreen', { userId: item._id })} />}
          keyExtractor={(item) => item._id}
          numColumns={2}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={status === 'loading' ? <ActivityIndicator /> : null}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});

export default HomeScreen;
