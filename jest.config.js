module.exports = {
  preset: 'jest-expo',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|expo|@react-native|@expo|@react-navigation|@react-native-async-storage/async-storage|react-native-vector-icons|expo-image-picker))',
  ],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  testPathIgnorePatterns: ['/node_modules/', '/.history/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
