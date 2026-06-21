# Android Build Guide

This guide covers building the Sellingpoint Android app — from a debug APK for testing, to a signed release APK or AAB for distribution on the Google Play Store.

**Prerequisites:** Complete [MOBILE-SETUP.md](MOBILE-SETUP.md) first. You need a working development environment with Android Studio and Java JDK 17 installed.

---

## Understanding Build Types

| Build Type | File | Purpose |
|-----------|------|---------|
| Debug APK | `app-debug.apk` | Development and internal testing. Auto-signed with a debug key. Cannot be published to Play Store. |
| Release APK | `app-release.apk` | Distribution outside Play Store (direct download, sideloading). Must be signed with your own keystore. |
| Release AAB | `app-release.aab` | Google Play Store submission. Preferred format for Play Store. Must be signed. |

---

## Building a Debug APK

Use this for sharing the app with testers or quickly testing on a device without going through the emulator setup.

```bash
cd sellingpoint/mobile/android
./gradlew assembleDebug
```

**Windows:**
```bash
cd sellingpoint\mobile\android
gradlew.bat assembleDebug
```

**Build output:**
```
sellingpoint/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

**First build time:** 5–15 minutes (Gradle downloads dependencies)
**Subsequent builds:** 1–3 minutes

**Install directly to a connected device:**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Building a Release APK or AAB

Before building a release version, you must:
1. Generate a signing keystore (one time only)
2. Configure the signing credentials
3. Set the correct production API URL

### Before You Build: Update the API URL

Edit `sellingpoint/mobile/src/constants/index.ts` and set the production URL:

```typescript
export const API_BASE_URL = 'https://api.yourdomain.com/api/v1';
```

Do this before building. The API URL is baked into the app at build time.

---

### Step 1: Generate a Keystore File

A keystore is a file that contains your private signing key. Google uses the signature to verify that app updates come from you (the original developer) and not from someone else.

**Generate your keystore (run this once — keep the file safe forever):**
```bash
keytool -genkey -v \
  -keystore sellingpoint.keystore \
  -alias sellingpoint \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

On Windows, run this in Command Prompt (not PowerShell):
```
keytool -genkey -v -keystore sellingpoint.keystore -alias sellingpoint -keyalg RSA -keysize 2048 -validity 10000
```

The `keytool` command prompts you for information. Fill it in accurately — some of this appears in the app's certificate info:

```
Enter keystore password:            (create a strong password — save it somewhere safe)
Re-enter new password:              (repeat the same password)
What is your first and last name?   [Your Name or Organization Name]
What is the name of your organizational unit?   [Engineering / Development]
What is the name of your organization?   [Your Company Name]
What is the name of your City or Locality?   [Lagos]
What is the name of your State or Province?   [Lagos State]
What is the two-letter country code for this unit?   [NG]
Is CN=..., OU=..., O=..., L=..., ST=..., C=NG correct?   yes

Enter key password for <sellingpoint>
        (RETURN if same as keystore password):   (press Enter to use the same password)
```

This creates `sellingpoint.keystore` in your current directory.

**Copy it to the android folder:**
```bash
cp sellingpoint.keystore sellingpoint/mobile/android/app/sellingpoint.keystore
```

> **CRITICAL:** Back up this keystore file somewhere safe (cloud storage, external drive). If you lose it, you can NEVER publish an update to your Play Store app. Google will treat updates signed with a different key as a different app entirely.

---

### Step 2: Configure Signing in gradle.properties

Open or create the file `sellingpoint/mobile/android/gradle.properties` and add these lines:

```properties
# Release signing configuration
MYAPP_RELEASE_STORE_FILE=sellingpoint.keystore
MYAPP_RELEASE_KEY_ALIAS=sellingpoint
MYAPP_RELEASE_STORE_PASSWORD=your_keystore_password_here
MYAPP_RELEASE_KEY_PASSWORD=your_key_password_here
```

Replace `your_keystore_password_here` with the actual password you set in Step 1.

> **Security note:** Do not commit `gradle.properties` to version control if it contains passwords. Add it to `.gitignore`.

---

### Step 3: Configure build.gradle

Open `sellingpoint/mobile/android/app/build.gradle` and verify the `signingConfigs` and `buildTypes` sections look like this (add them if they are missing):

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

### Step 4: Build the Release APK

```bash
cd sellingpoint/mobile/android
./gradlew assembleRelease
```

**Output location:**
```
sellingpoint/mobile/android/app/build/outputs/apk/release/app-release.apk
```

This APK is signed and ready for distribution. You can share this file directly for installation (sideloading).

---

### Step 5: Build the Android App Bundle (AAB) for Play Store

Google Play requires AAB format (not APK) for new app submissions since August 2021.

```bash
cd sellingpoint/mobile/android
./gradlew bundleRelease
```

**Output location:**
```
sellingpoint/mobile/android/app/build/outputs/bundle/release/app-release.aab
```

Upload this `.aab` file to the Google Play Console.

---

## Versioning Your App

Before each release, update the version in `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        versionCode 2          // Integer — increment by 1 for every Play Store upload
        versionName "1.1.0"    // Human-readable version shown to users
    }
}
```

Rules:
- `versionCode` must always be higher than the previous upload. It cannot be reused.
- `versionName` is what users see (e.g., "1.0.0", "1.1.0", "2.0.0")

---

## Google Play Store Submission Checklist

Before you upload to the Play Store, make sure everything is in order:

### App Assets Required
- [ ] **App icon** — 512 x 512 pixels, PNG format, no alpha/transparency background
- [ ] **Feature graphic** — 1024 x 500 pixels, PNG or JPEG (shown at top of Play Store listing)
- [ ] **Screenshots** — Minimum 2, maximum 8. Recommended: 1080 x 1920 (portrait phone)
- [ ] **Short description** — Up to 80 characters
- [ ] **Full description** — Up to 4000 characters

### Technical Requirements
- [ ] Target API Level 34 (Android 14) — set in `build.gradle`: `targetSdkVersion 34`
- [ ] Minimum API Level — recommended: 21 (Android 5.0)
- [ ] Signed with release keystore (not debug key)
- [ ] `versionCode` is higher than any previously uploaded version
- [ ] AAB format (not APK) for new apps

### Legal Requirements
- [ ] Privacy policy URL — required if app collects any user data
- [ ] Data safety section completed in Play Console

### App Content
- [ ] Content rating questionnaire completed
- [ ] App tested on at least one real device
- [ ] No placeholder content or lorem ipsum text

### Before Uploading
- [ ] `APP_DEBUG=false` in backend `.env`
- [ ] `APP_ENV=production` in backend `.env`
- [ ] API URL points to production server (not `10.0.2.2` or localhost)
- [ ] Live Paystack keys are configured (not test keys)
- [ ] OneSignal is configured and tested

---

## Distributing Outside the Play Store

If you want to distribute directly (e.g., share APK via WhatsApp or your website):

1. Build the release APK (Step 4)
2. Share the `app-release.apk` file
3. Recipients need to:
   - Go to **Settings → Security** on their phone
   - Enable **Install unknown apps** for the browser or file manager they use
   - Open the APK file and tap Install

---

## Rebuilding After Code Changes

When you make changes to the app and want to release a new version:

1. Update `API_BASE_URL` if needed
2. Increment `versionCode` and update `versionName`
3. Run `./gradlew bundleRelease` (or `assembleRelease`)
4. Upload the new AAB to Play Console → select the same release track → create new release

---

## React Native Vector Icons — Font Setup

The app uses `react-native-vector-icons` for all icons. This library requires
the icon font files to be bundled into the Android app.

React Native 0.60+ uses autolinking — the library links itself automatically.
However, **fonts must be listed in `android/app/build.gradle`**:

```gradle
// android/app/build.gradle — add inside the `android { ... }` block:
project.ext.vectoricons = [
    iconFontNames: [ 'Ionicons.ttf', 'MaterialIcons.ttf' ]
]

apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

If you skip this step, icons render as empty boxes on Android.

---

## Common Build Errors

### "Keystore file not found"
The keystore path in `gradle.properties` is wrong. Make sure `sellingpoint.keystore` is in `android/app/` and the path in `gradle.properties` matches.

### "Wrong password"
The password in `gradle.properties` does not match what you set when creating the keystore. Re-create the keystore if you have forgotten the password.

### "Duplicate resources" error
Run a clean build:
```bash
./gradlew clean
./gradlew bundleRelease
```

### Build succeeds but app crashes on launch
- Check Logcat in Android Studio for the crash stack trace
- Common cause: API URL is unreachable (check `API_BASE_URL`)
- Another cause: missing permissions in `AndroidManifest.xml`

### "INSTALL_FAILED_UPDATE_INCOMPATIBLE"
You are trying to install a release build on a device that has the debug build installed. Uninstall the debug version first:
```bash
adb uninstall com.sellingpoint
```
(Replace `com.sellingpoint` with your actual package name)
