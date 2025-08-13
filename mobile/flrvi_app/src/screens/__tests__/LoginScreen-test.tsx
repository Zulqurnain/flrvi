import React from 'react';
import renderer from 'react-test-renderer';
import LoginScreen from '../LoginScreen';
import { Provider } from 'react-redux';
import { store } from '../../store/store';

it('renders correctly', () => {
  const tree = renderer.create(
    <Provider store={store}>
      <LoginScreen />
    </Provider>
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
