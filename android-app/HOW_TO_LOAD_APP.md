# 📱 How to Load and Run the TapPass Android App

## Prerequisites

1. **Android Studio** - Download from [developer.android.com](https://developer.android.com/studio)
2. **Android SDK** - Will be installed with Android Studio
3. **NFC-enabled device** OR **Android Emulator with NFC support**
4. **Backend running** - The API server should be running (see backend setup)

## Step-by-Step Guide

### Step 1: Open Android Studio

1. Launch **Android Studio**
2. If this is your first time:
   - Complete the setup wizard
   - Install Android SDK (API 24 or higher)
   - Accept licenses

### Step 2: Open the Project

**Option A: From Welcome Screen**
1. Click **"Open"** or **"Open an Existing Project"**
2. Navigate to: `/Users/pablo/TapPass/android-app`
3. Click **"OK"**

**Option B: From File Menu**
1. File → Open
2. Select the `android-app` folder
3. Click **"OK"**

### Step 3: Wait for Gradle Sync

Android Studio will automatically:
- Download dependencies
- Sync Gradle files
- Index the project

**This may take 5-10 minutes the first time.**

You'll see progress in the bottom status bar. Wait for "Gradle sync finished" message.

### Step 4: Configure Backend URL

1. Navigate to: `app/src/main/java/com/tappass/android/MainActivity.kt`
2. Find line ~124 (look for `val backendUrl =`)
3. Update based on your setup:

**For Android Emulator:**
```kotlin
val backendUrl = "http://10.0.2.2:3000"
```

**For Physical Device (same WiFi):**
```kotlin
// Find your computer's IP address first:
// Mac/Linux: ifconfig | grep inet
// Windows: ipconfig
// Then use:
val backendUrl = "http://192.168.1.XXX:3000"  // Replace XXX with your IP
```

**Example:**
```kotlin
// Line ~124 in MainActivity.kt
val backendUrl = "http://10.0.2.2:3000"  // For emulator
```

### Step 5: Set Up Device/Emulator

**Option A: Physical Device**
1. Enable **Developer Options** on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable **USB Debugging**:
   - Settings → Developer Options → USB Debugging (ON)
3. Connect device via USB
4. Allow USB debugging when prompted on device

**Option B: Android Emulator**
1. Tools → Device Manager
2. Click **"Create Device"**
3. Select a device (e.g., Pixel 5)
4. Select a system image (API 24 or higher)
5. Click **"Finish"**
6. Click **"Play"** button to start emulator

### Step 6: Build the App

1. Click **"Build"** menu → **"Make Project"**
   - Or press `Cmd + F9` (Mac) / `Ctrl + F9` (Windows)
2. Wait for build to complete
3. Check for errors in the **"Build"** tab at the bottom

**If you see errors:**
- Click "Sync Project with Gradle Files" (elephant icon)
- Wait for sync to complete
- Try building again

### Step 7: Run the App

**Method 1: Run Button**
1. Click the green **"Run"** button (▶️) in the toolbar
2. Select your device/emulator
3. Click **"OK"**

**Method 2: Right-Click**
1. Right-click on `app` folder in Project view
2. Select **"Run 'app'"**

**Method 3: Keyboard Shortcut**
- Press `Shift + F10` (Windows/Linux) or `Ctrl + R` (Mac)

### Step 8: Wait for Installation

Android Studio will:
1. Build the APK
2. Install on your device/emulator
3. Launch the app automatically

You should see the TapPass app open!

## 🧪 Testing the App

### Test 1: Check Connection

1. Open the app
2. Look at the status - should show "Ready to scan..."
3. Check backend logs - you should see a request to `/omnichain/chains`

### Test 2: Test NFC (Physical Device)

1. Enable NFC on your device (Settings → NFC)
2. Tap an NFC tag/card to the back of your device
3. App should detect the tag
4. Shows tag hash
5. Attempts registration
6. Shows success message

### Test 3: Test NFC (Emulator)

Emulators don't have real NFC, but you can:
1. Use NFC tools to simulate tags
2. Or test the API connection manually

## 🔧 Troubleshooting

### "Gradle sync failed"
```bash
# In terminal, navigate to android-app folder
cd android-app
./gradlew clean
```
Then in Android Studio: File → Sync Project with Gradle Files

### "Cannot resolve symbol"
- File → Invalidate Caches → Invalidate and Restart
- Wait for re-indexing

### "App won't install"
- Check device has enough storage
- Uninstall old version if exists
- Check USB debugging is enabled

### "Can't connect to backend"
- **Emulator**: Must use `10.0.2.2`, not `localhost`
- **Physical**: Use computer's IP, ensure same WiFi
- Check backend is running: `curl http://localhost:3000/health`
- Check firewall allows port 3000

### "NFC not working"
- Enable NFC in device settings
- Check device has NFC hardware
- Try different NFC tag
- Check permissions in AndroidManifest.xml

### "Build errors"
- Check Android Studio version (Hedgehog 2023.1.1+)
- Check Java version (should be 17+)
- Sync Gradle: File → Sync Project with Gradle Files

## 📋 Quick Checklist

Before running:
- [ ] Android Studio installed
- [ ] Project opened successfully
- [ ] Gradle sync completed
- [ ] Backend URL configured
- [ ] Device/emulator connected
- [ ] Backend server running
- [ ] NFC enabled (for physical device)

## 🎯 Expected Result

When everything works:
1. App launches
2. Shows "TapPass" title
3. Shows "Ready to scan..."
4. When you tap NFC tag:
   - Detects tag
   - Shows tag hash
   - Shows "Registering tag..."
   - Shows "Tag registered cross-chain!"

## 💡 Pro Tips

1. **Use Emulator First** - Easier to debug, no hardware needed
2. **Check Logs** - View → Tool Windows → Logcat for app logs
3. **Test API First** - Use curl/Postman before testing app
4. **Start Simple** - Test connection before testing NFC

## 📞 Need More Help?

- Check `android-app/README.md` for app-specific details
- Check `TESTING_GUIDE.md` for testing steps
- Check backend logs for API errors
- Check Android Studio Logcat for app errors

---

**You're all set! Open Android Studio and follow the steps above. 🚀**



