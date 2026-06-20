# Mobile App Setup Guide

## Requirements

- Node.js 18+
- React Native CLI (not Expo)
- Android Studio (for Android)
- Xcode 15+ (for iOS, macOS only)
- JDK 17

## Installation

```bash
cd mobile
npm install
```

## Android Setup

### 1. Android Studio

Install [Android Studio](https://developer.android.com/studio) and configure:

- SDK Platform: Android 14 (API 34)
- SDK Tools: Android SDK Build-Tools 34, Android Emulator

### 2. Environment Variables

Add to `~/.bashrc` or `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 3. Start Emulator

```bash
# List available AVDs
emulator -list-avds

# Start emulator
emulator -avd Pixel_6_API_34
```

### 4. Run App

```bash
npx react-native run-android
```

## iOS Setup (macOS only)

```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

## API URL Configuration

Edit `src/constants/index.ts`:

```typescript
// Android emulator → host machine
export const API_BASE_URL = 'http://10.0.2.2:8000/api/v1';

// iOS simulator → host machine
// export const API_BASE_URL = 'http://localhost:8000/api/v1';

// Physical device → use your machine's LAN IP
// export const API_BASE_URL = 'http://192.168.x.x:8000/api/v1';

// Production
// export const API_BASE_URL = 'https://api.yourapp.com/api/v1';
```

## Build Release APK

```bash
cd android
./gradlew bundleRelease   # AAB for Play Store
./gradlew assembleRelease # APK for direct install
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react-native | 0.76.5 | Core framework |
| @react-navigation/native | ^6 | Navigation |
| @react-navigation/bottom-tabs | ^6 | Tab navigation |
| @react-navigation/stack | ^6 | Stack navigation |
| axios | ^1.7 | HTTP client |
| zustand | ^5 | State management |
| react-native-paper | ^5 | UI components |
| @react-native-async-storage/async-storage | ^2 | Token persistence |
| react-native-gesture-handler | ^2 | Gestures |
| react-native-safe-area-context | ^4 | Safe areas |
