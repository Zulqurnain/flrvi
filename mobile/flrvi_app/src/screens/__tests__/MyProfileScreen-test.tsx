import React from 'react';
import renderer from 'react-test-renderer';
import MyProfileScreen from '../MyProfileScreen';
import { Provider } from 'react-redux';
import { store } from '../../store/store';

it('renders correctly', () => {
  const navigation = { navigate: jest.fn(), openDrawer: jest.fn() };
  const tree = renderer.create(
    <Provider store={store}>
      <MyProfileScreen navigation={navigation} />
    </Provider>
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
