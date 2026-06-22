const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * react-native-paystack-webview bundles its own react-native-safe-area-context
 * in its nested node_modules. Metro resolves that closer copy first, causing
 * RNCSafeAreaView to be registered twice → crash on startup.
 *
 * resolveRequest intercepts every require('react-native-safe-area-context')
 * in the entire graph and re-resolves it as if it originated from the project
 * root, ensuring only the single root copy is ever used.
 */
const DEDUP = ['react-native-safe-area-context'];

const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (DEDUP.includes(moduleName)) {
        return context.resolveRequest(
          { ...context, originModulePath: path.join(__dirname, 'index.js') },
          moduleName,
          platform,
        );
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
