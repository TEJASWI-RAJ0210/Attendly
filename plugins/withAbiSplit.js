const { withAppBuildGradle } = require("expo/config-plugins");

/**
 * Restricts the release APK to arm64-v8a only, instead of bundling native
 * libraries for arm64-v8a, armeabi-v7a, x86, and x86_64 all in one
 * "universal" APK. arm64-v8a covers the vast majority of Android phones
 * from roughly 2017 onward.
 *
 * Trade-off: this build will not install on very old 32-bit-only Android
 * phones (rare in practice) or on x86 emulators. If you ever need those,
 * remove this plugin from app.json to go back to a universal build.
 */
module.exports = function withAbiSplit(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.contents.includes("splits {")) {
      return config; // already applied, avoid inserting twice
    }
    config.modResults.contents = config.modResults.contents.replace(
      /android\s*\{/,
      `android {
    splits {
        abi {
            enable true
            reset()
            include "arm64-v8a"
            universalApk false
        }
    }
`
    );
    return config;
  });
};
