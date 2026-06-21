# Mobile App Setup Guide

This guide walks you through setting up the React Native mobile app on your development machine. By the end you will have the app running on an Android emulator (or physical device).

**Before you start:** The backend must be running (see [BACKEND-SETUP.md](BACKEND-SETUP.md)). The mobile app cannot function without the API.

**Time required:** 30–60 minutes (mostly waiting for downloads).

---

## Overview of What You Will Install

1. Node.js — to run JavaScript tools
2. Java JDK 17 — to compile Android apps
3. Android Studio — for the SDK and emulator
4. Configure environment variables
5. Install the app's dependencies
6. Configure the API URL
7. Start Metro bundler
8. Run the app on Android

---

## Step 1: Install Node.js

Node.js is the runtime that powers Metro (the React Native development server) and npm (the package manager).

1. Open your browser and go to: https://nodejs.org
2. Click the big **LTS** button (Long Term Support — more stable than Current)
3. Download the installer for your operating system
4. Run the installer:
   - **Windows:** Click through the wizard, keeping all defaults checked. Make sure "Add to PATH" is checked.
   - **Mac:** Open the `.pkg` file and follow the prompts
   - **Linux:** Use your package manager or the official installer script
5. After installation, **restart your terminal** (important — old terminal windows won't see the new PATH)

**Verify installation:**
```bash
node --version
npm --version
```

Expected output:
```
v20.x.x   (or any version 18+)
10.x.x
```

If you see "command not found", restart your terminal and try again.

---

## Step 2: Install Java JDK 17

Android's build system requires Java. You need specifically JDK 17 (not 8, not 11, not 21 — 17).

1. Open your browser and go to: https://adoptium.net
2. Find the **Temurin 17 (LTS)** download
3. Select your operating system
4. Download the installer (`.msi` for Windows, `.pkg` for Mac, `.deb`/`.rpm` for Linux)
5. Run the installer with default settings

**Set JAVA_HOME (required for Android builds):**

**Windows:**
1. Press `Windows + R`, type `sysdm.cpl`, press Enter
2. Click the **Advanced** tab
3. Click **Environment Variables**
4. Under **System variables**, click **New**
5. Variable name: `JAVA_HOME`
6. Variable value: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot`
   (Replace `x.x.x.x` with the actual version number you installed)
7. Find the `Path` variable in System variables, click **Edit**
8. Click **New** and add: `%JAVA_HOME%\bin`
9. Click OK on all dialogs
10. Restart your terminal

**Mac (add to `~/.zshrc` or `~/.bash_profile`):**
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH=$PATH:$JAVA_HOME/bin
```
Then run: `source ~/.zshrc`

**Linux (add to `~/.bashrc`):**
```bash
export JAVA_HOME=/usr/lib/jvm/temurin-17
export PATH=$PATH:$JAVA_HOME/bin
```
Then run: `source ~/.bashrc`

**Verify:**
```bash
java -version
```

Expected output (must show version 17):
```
openjdk version "17.x.x" ...
```

---

## Step 3: Install Android Studio

Android Studio provides the Android SDK (the tools needed to build and run Android apps) and the emulator.

1. Open your browser and go to: https://developer.android.com/studio
2. Click **Download Android Studio**
3. Accept the terms and download
4. Run the installer:
   - **Windows:** Run the `.exe`, accept defaults, install to default location
   - **Mac:** Open the `.dmg`, drag Android Studio to Applications
   - **Linux:** Extract the `.tar.gz` to `~/android-studio`, then run `./bin/studio.sh`
5. Launch Android Studio
6. The **Setup Wizard** appears on first launch:
   - Select **Standard** install type
   - Choose a UI theme (Light or Dark — your preference)
   - Click **Finish** — it will download SDK components (takes 5–15 minutes)

---

## Step 4: Configure the Android SDK

After Android Studio installs, verify the SDK has the correct components.

1. Open Android Studio
2. Click **More Actions** (or the hamburger menu) → **SDK Manager**
   (Or from an open project: **Tools → SDK Manager**)
3. In the **SDK Platforms** tab:
   - Find **Android 14.0 ("UpsideDownCake") API Level 34**
   - Check the checkbox next to it
4. Click the **SDK Tools** tab:
   - Check **Android SDK Build-Tools 34**
   - Check **Android SDK Command-line Tools (latest)**
   - Check **Android Emulator**
   - Check **Android SDK Platform-Tools**
5. Click **Apply** → **OK**
6. Wait for downloads to complete (this can take several minutes)

---

## Step 5: Create an Android Emulator

The emulator is a virtual Android phone running on your computer — you will use it to test the app without a physical device.

1. In Android Studio, go to **Tools → Device Manager** (or **AVD Manager** in older versions)
2. Click **Create Device** (or the **+** button)
3. Select **Phone** from the category list on the left
4. Select **Pixel 6** from the device list
5. Click **Next**
6. You will see a list of Android versions to install on the emulator
7. Find **UpsideDownCake** (API Level 34 — Android 14)
   - If there is a download arrow next to it, click it to download the system image
   - This download is approximately 1–2 GB
8. After downloading, select **UpsideDownCake** and click **Next**
9. Review the configuration:
   - AVD Name: `Pixel_6_API_34` (you can change this)
   - Startup orientation: Portrait
10. Click **Finish**

**Start the emulator:**
1. In Device Manager, find your Pixel 6 emulator
2. Click the **play button** (triangle) next to it
3. Wait for the emulator to fully boot — this can take 1–3 minutes on first launch
4. You will see an Android home screen when it is ready

---

## Step 6: Set Android Environment Variables

React Native needs to know where your Android SDK is installed.

**Windows:**
1. Press `Windows + R`, type `sysdm.cpl`, press Enter
2. Click **Advanced** → **Environment Variables**
3. Under **System variables**, click **New**:
   - Name: `ANDROID_HOME`
   - Value: `C:\Users\YourUsername\AppData\Local\Android\Sdk`
   (Replace `YourUsername` with your actual Windows username)
4. Edit the `Path` variable and add these two entries:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\emulator`
5. Click OK everywhere and restart your terminal

**Mac/Linux (add to `~/.zshrc` or `~/.bashrc`):**
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```
Then run: `source ~/.zshrc`

**Verify adb (Android Debug Bridge) works:**
```bash
adb --version
```
You should see: `Android Debug Bridge version x.x.x`

---

## Step 7: Install App Dependencies

Navigate to the mobile folder:
```bash
cd sellingpoint/mobile
```

Install all JavaScript dependencies:
```bash
npm install
```

This reads `package.json` and downloads all the React Native packages into a `node_modules/` folder. The first install takes 2–5 minutes.

You should see output ending with:
```
added 1234 packages in 45s
```

---

## Step 8: Configure the API URL

The mobile app needs to know the address of your backend API. This address is different depending on how you are running the app.

Find and open this file:
```
sellingpoint/mobile/src/constants/index.ts
```

Look for the `API_BASE_URL` constant and update it:

**If running on Android Emulator:**
```typescript
export const API_BASE_URL = 'http://10.0.2.2:8000/api/v1';
```
`10.0.2.2` is a special address that the Android emulator uses to reach the host machine (your computer). It is equivalent to `localhost` from the emulator's perspective.

**If running on a physical Android device:**
```typescript
export const API_BASE_URL = 'http://192.168.1.X:8000/api/v1';
```
Replace `192.168.1.X` with your computer's actual IP address on the local network. To find your IP:
- Windows: run `ipconfig` in Command Prompt, look for IPv4 Address
- Mac: run `ipconfig getifaddr en0` in Terminal
- Linux: run `hostname -I`

Your phone and computer must be on the same Wi-Fi network.

**For production (deployed server):**
```typescript
export const API_BASE_URL = 'https://api.yourdomain.com/api/v1';
```

---

## Step 9: Start Metro Bundler

Metro is the JavaScript bundler for React Native — it compiles your TypeScript code and serves it to the app.

Make sure you are in the `mobile/` directory, then run:
```bash
npm start
```

You will see the Metro welcome screen:
```
                         Welcome to Metro v0.81
               Fast - Scalable - Integrated React Native Bundler
...
BUNDLE  ./index.js
```

Leave this terminal window open. Metro must be running while you develop.

---

## Step 10: Run the App on Android

Open a **second terminal window** (keep the Metro bundler running in the first). Navigate back to the mobile folder:
```bash
cd sellingpoint/mobile
```

Start the Android build:
```bash
npm run android
```

This command:
1. Compiles the Android Java/Kotlin code using Gradle
2. Installs the compiled app on the running emulator
3. Connects to your Metro bundler to load the JavaScript

**First build takes 3–10 minutes** — Gradle downloads dependencies and compiles everything. Subsequent builds are much faster.

When successful, the Android emulator will show the Sellingpoint app loading, then the home screen with products.

---

## Running on a Physical Device

If you prefer to test on a real Android phone:

1. On your Android phone, go to **Settings → About Phone**
2. Tap **Build Number** 7 times until you see "You are now a developer"
3. Go to **Settings → Developer Options**
4. Enable **USB Debugging**
5. Connect your phone to your computer with a USB cable
6. On your phone, allow the connection when prompted: "Allow USB Debugging?"
7. Run `adb devices` in your terminal — you should see your device listed
8. Run `npm run android` — it will install to your phone instead of the emulator

Make sure you have updated `API_BASE_URL` to your computer's IP address (not `10.0.2.2`) as described in Step 8.

---

## Troubleshooting Common Issues

### "SDK location not found"
The `ANDROID_HOME` environment variable is not set or incorrect. Double-check Step 6.

### Metro fails to start / port 8081 already in use
Kill the existing Metro process:
```bash
# Mac/Linux:
kill -9 $(lsof -ti:8081)

# Windows (PowerShell):
Get-Process node | Stop-Process
```
Then run `npm start` again.

### App shows "Network request failed" or blank screen
The app cannot reach the backend API. Check:
1. Is `php artisan serve` running?
2. Is the `API_BASE_URL` using `10.0.2.2` (emulator) or the correct IP (physical device)?
3. Is port 8000 blocked by a firewall?

### Gradle build fails with "SDK version X is not installed"
Open Android Studio → SDK Manager and install the missing SDK version.

### "Unable to load script from assets" error
Metro is not running. Go back to your first terminal and run `npm start`.

### Emulator is very slow
- In Android Studio AVD Manager, edit the emulator
- Change Graphics to "Hardware - GLES 2.0"
- Allocate more RAM (2 GB recommended)
- Enable VM acceleration: on Windows, ensure Hyper-V or HAXM is enabled

---

## Development Workflow

Once everything is set up, your daily workflow is:

1. Start MySQL (XAMPP Control Panel)
2. Run `php artisan serve` in the backend folder
3. Run `npm start` in the mobile folder (Metro bundler)
4. Start the Android emulator from Android Studio
5. Run `npm run android` once to install the app
6. After that, the app hot-reloads as you save file changes

**Hot Reload:** Shake the device (or press `Ctrl+M` in the emulator) to access the developer menu. Enable "Fast Refresh" for automatic reloads when you save files.

**View logs:** Metro shows JavaScript errors in the terminal. Android-specific errors appear in Android Studio's Logcat.

---

## Next Steps

- [Android Build Guide](ANDROID-BUILD.md) — Build a release APK or AAB
- [API Documentation](API-DOCS.md) — How the app communicates with the backend
- [Deployment Guide](DEPLOYMENT-GUIDE.md) — Deploy to production
