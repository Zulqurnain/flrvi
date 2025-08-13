import React from 'react';
import renderer from 'react-test-renderer';
import ProfileScreen from '../ProfileScreen';
import { Provider } from 'react-redux';
import { store } from '../../store/store';

it('renders correctly', () => {
  const route = { params: { userId: '123' } };
  const navigation = { navigate: jest.fn() };
  const tree = renderer.create(
    <Provider store={store}>
      <ProfileScreen route={route} navigation={navigation} />
    </Provider>
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
