module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|@expo|expo-.*|@react-native-segmented-control/segmented-control|react-native-date-picker|react-native-image-picker|react-native-reanimated|@react-native-community|react-native-iphone-x-helper|styled-components|@react-navigation/native|react-native-gesture-handler|react-native-screens|@react-native-picker/picker|react-native-vector-icons|@react-navigation/stack)/)',
  ],
};
