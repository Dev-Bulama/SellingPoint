const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Force Metro to resolve react-native-safe-area-context from the root
 * node_modules only, preventing the nested copy bundled inside
 * react-native-paystack-webview from registering a duplicate native view.
 */
const config = {
  resolver: {
    extraNodeModules: {
      'react-native-safe-area-context': path.resolve(
        __dirname,
        'node_modules/react-native-safe-area-context',
      ),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
