module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // zod v4 ships `export * as x from`, which the React Native preset does not transform.
  plugins: ['@babel/plugin-transform-export-namespace-from'],
};
