module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-reanimated v4 no longer requires a Babel plugin.
    // The worklets transform is handled automatically by react-native-worklets.
  };
};
