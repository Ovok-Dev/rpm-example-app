import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Ovok Care",
  slug: "ovok-rpm-example",
  scheme: "ovok-care",
  version: "1.0.0",
  icon: "./assets/icon.png",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  ios: {
    bundleIdentifier: "com.ovok.rpm.example",
    supportsTablet: false,
    infoPlist: {
      EXDevMenuShowFloatingActionButton: false,
      EXDevMenuShowsAtLaunch: false,
      EXDevMenuIsOnboardingFinished: true,
    },
  },
  android: { package: "com.ovok.rpm.example" },
  plugins: [
    "expo-secure-store",
    [
      "react-native-ble-plx",
      {
        isBackgroundEnabled: false,
        bluetoothAlwaysPermission:
          "Connect to your Viatom BP2 and LeScale to receive your measurements.",
      },
    ],
    ["react-native-permissions", { iosPermissions: ["Bluetooth"] }],
  ],
};

export default config;
