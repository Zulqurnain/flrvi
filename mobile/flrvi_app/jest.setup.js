import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock for expo-modules-core
jest.mock('expo-modules-core', () => ({
  NativeModulesProxy: {},
  NativeModule: {
    getConstants: () => ({}),
  },
  requireNativeModule: jest.fn(),
}));

// Mock for expo-font to resolve requireNativeModule errors
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn().mockReturnValue(true),
}));

// Mock for @expo/vector-icons to avoid native module issues
jest.mock('@expo/vector-icons', () => ({
  Ionicons: '',
}));

// Simplified UIManager mock that avoids requireActual issues
jest.mock('react-native/Libraries/ReactNative/UIManager', () => ({
  __esModule: true,
  default: {
    getConstants: () => ({
      UIManager: {
        RCTView: {
          Constants: {
            borderWidth: 1,
            borderColor: 'black',
          },
        },
        RCTText: {},
        RCTScrollView: {},
      },
      Dimensions: {
        window: {
          width: 320,
          height: 640,
          scale: 2,
          fontScale: 2,
        },
        screen: {
          width: 320,
          height: 640,
          scale: 2,
          fontScale: 2,
        },
      },
    }),
    getViewManagerConfig: (name) => {
      if (name === 'RCTView') {
        return {
          Constants: {
            borderWidth: 1,
            borderColor: 'black',
          },
        };
      }
      return null;
    },
  },
}));
