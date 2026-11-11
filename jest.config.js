module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  // These packages ship untranspiled ES modules, so Jest must run them through Babel.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-vector-icons|@react-navigation|react-native-screens|react-native-safe-area-context|react-native-keychain|react-redux|@reduxjs/toolkit|redux|immer|reselect)/)',
  ],
};
