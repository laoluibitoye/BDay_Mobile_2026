const { withPodfile } = require('@expo/config-plugins');
const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode');

const TAG = 'withModularHeaders';
const ANCHOR = /prepare_react_native_project!/;
// With SPM disabled for react-native-firebase, Firebase falls back to CocoaPods
// integration — several of its Swift pods (FirebaseCoreInternal, FirebaseCrashlytics,
// FirebaseSessions) depend on pods that don't define Swift modules (GoogleUtilities,
// GoogleDataTransport, nanopb), which static-library linking requires.
// `use_modular_headers!` is CocoaPods' own documented fix for exactly this.
const FLAG = 'use_modular_headers!';

const withModularHeaders = (config) => {
  return withPodfile(config, (config) => {
    config.modResults.contents = mergeContents({
      src: config.modResults.contents,
      newSrc: FLAG,
      tag: TAG,
      anchor: ANCHOR,
      offset: 1,
      comment: '#',
    }).contents;

    return config;
  });
};

module.exports = withModularHeaders;
