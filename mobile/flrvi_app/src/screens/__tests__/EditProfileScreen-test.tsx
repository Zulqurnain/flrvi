import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import EditProfileScreen from '../EditProfileScreen';
import { updateUserProfile } from '../../store/userSlice';

const mockStore = configureStore([]);
const mockNavigation = { goBack: jest.fn() };

describe('EditProfileScreen', () => {
  let store;
  let component;

  beforeEach(() => {
    store = mockStore({
      user: {
        profile: {
          bio: 'I am a software engineer.',
          photos: [],
        },
        status: 'idle',
        error: null,
      },
    });

    component = (
      <Provider store={store}>
        <EditProfileScreen navigation={mockNavigation} />
      </Provider>
    );
  });

  it('renders correctly with initial profile data', () => {
    const { getByDisplayValue } = render(component);
    expect(getByDisplayValue('I am a software engineer.')).toBeTruthy();
  });

  it('dispatches an action to update the user profile when the form is submitted', () => {
    const { getByText, getByDisplayValue } = render(component);

    fireEvent.changeText(getByDisplayValue('I am a software engineer.'), 'I am a product manager.');

    fireEvent.press(getByText('Save'));

    const expectedAction = updateUserProfile({
      bio: 'I am a product manager.',
      photos: [],
    });

    const actions = store.getActions();
    expect(actions).toContainEqual(expectedAction);
  });
});
