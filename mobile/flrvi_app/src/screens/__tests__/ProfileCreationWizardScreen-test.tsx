import React from 'react';
import renderer from 'react-test-renderer';
import ProfileCreationWizardScreen from '../ProfileCreationWizardScreen';
import { Provider } from 'react-redux';
import { store } from '../../store/store';

it('renders correctly', () => {
  const navigation = { navigate: jest.fn() };
  const tree = renderer.create(
    <Provider store={store}>
      <ProfileCreationWizardScreen navigation={navigation} />
    </Provider>
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
