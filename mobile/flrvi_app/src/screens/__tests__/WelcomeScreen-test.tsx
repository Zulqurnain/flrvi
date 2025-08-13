import React from 'react';
import renderer from 'react-test-renderer';
import WelcomeScreen from '../WelcomeScreen';

it('renders correctly', () => {
  const navigation = { navigate: jest.fn() };
  const tree = renderer.create(<WelcomeScreen navigation={navigation} />).toJSON();
  expect(tree).toMatchSnapshot();
});
