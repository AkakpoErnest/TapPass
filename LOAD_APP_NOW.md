# 📱 Load the Android App - Step by Step

## 🎯 What You Need First

1. ✅ **Backend running** - Start it with: `cd backend && npm start`
2. ✅ **Android Studio installed** - [Download here](https://developer.android.com/studio)

## 📋 Step-by-Step Instructions

### 1️⃣ Open Android Studio

- Launch Android Studio
- If first time: Complete setup wizard (install SDK, accept licenses)

### 2️⃣ Open the Project

**Click:** `File` → `Open` → Navigate to `/Users/pablo/TapPass/android-app` → Click `OK`

**OR** from Welcome Screen: Click `Open` → Select `android-app` folder

### 3️⃣ Wait for Gradle Sync ⏳

- Android Studio will automatically sync Gradle
- **First time: 5-10 minutes** (downloading dependencies)
- Look for "Gradle sync finished" in bottom status bar
- ⚠️ **Don't close Android Studio during sync!**

### 4️⃣ Update Backend URL 🔧

**File to edit:** `app/src/main/java/com/tappass/android/MainActivity.kt`

**Find line ~127:**
```kotlin
val backendUrl = "http://10.0.2.2:3000"
```

**Choose based on your setup:**

**For Android Emulator:**
```kotlin
val backendUrl = "http://10.0.2.2:3000"  // ✅ Already set!
```

**For Physical Device:**
```kotlin
// First, find your computer's IP:
// Mac: ifconfig | grep inet
// Windows: ipconfig
// Then use:
val backendUrl = "http://192.168.1.XXX:3000"  // Replace XXX
```

### 5️⃣ Set Up Device/Emulator 📱

**Option A: Use Emulator (Easier)**
1. Click `Tools` → `Device Manager`
2. Click `Create Device` (if no devices)
3. Select device (e.g., Pixel 5)
4. Select system image (API 24+)
5. Click `Finish`
6. Click ▶️ Play button to start emulator

**Option B: Use Physical Device**
1. Enable Developer Options:
   - Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging ON
3. Connect device via USB
4. Allow USB debugging when prompted

### 6️⃣ Build the App 🔨

1. Click `Build` menu → `Make Project`
   - OR press `Cmd + F9` (Mac) / `Ctrl + F9` (Windows)
2. Wait for build to complete
3. Check bottom "Build" tab for errors

### 7️⃣ Run the App ▶️

**Click the green Run button** (▶️) in toolbar:
- Select your device/emulator
- Click `OK`
- App will build, install, and launch automatically!

## ✅ Success!

You should see:
- TapPass app opens
- Shows "TapPass" title
- Shows "Ready to scan..." status
- App is ready to test!

## 🧪 Test It

1. **Check Connection:**
   - App should load available chains on startup
   - Check backend logs for API calls

2. **Test NFC (Physical Device):**
   - Enable NFC in device settings
   - Tap an NFC tag to the back of device
   - App should detect and register

3. **Test NFC (Emulator):**
   - Use NFC simulation tools
   - Or test API connection manually

## 🔧 Common Issues

### "Gradle sync failed"
```bash
cd android-app
./gradlew clean
```
Then: `File` → `Sync Project with Gradle Files`

### "Cannot resolve symbol"
- `File` → `Invalidate Caches` → `Invalidate and Restart`

### "Can't connect to backend"
- **Emulator**: Must use `10.0.2.2`, not `localhost`
- **Physical**: Use computer IP, ensure same WiFi
- Check backend is running: `curl http://localhost:3000/health`

### "App won't install"
- Uninstall old version if exists
- Check USB debugging enabled
- Check device has storage space

## 📍 File Locations

- **Main Code:** `app/src/main/java/com/tappass/android/MainActivity.kt`
- **Backend URL:** Line ~127 in MainActivity.kt
- **Layout:** `app/src/main/res/layout/activity_main.xml`
- **Manifest:** `app/src/main/AndroidManifest.xml`

## 🎯 Quick Reference

```bash
# 1. Start backend first
cd backend
npm install  # if not done
npm start

# 2. Then in Android Studio:
# - Open android-app folder
# - Wait for Gradle sync
# - Update backend URL (line ~127)
# - Connect device
# - Click Run ▶️
```

## 💡 Pro Tips

1. **Start with Emulator** - Easier, no hardware needed
2. **Check Logcat** - View → Tool Windows → Logcat for app logs
3. **Test Backend First** - Use curl before testing app
4. **Keep Backend Running** - App needs it to work

---

**That's it! Open Android Studio and follow these steps. 🚀**

For more details, see: `android-app/HOW_TO_LOAD_APP.md`



