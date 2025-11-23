# 🚀 Quick Start - Load Android App (5 Minutes)

## Step 1: Open in Android Studio
```
1. Open Android Studio
2. Click "Open" → Select "android-app" folder
3. Wait for Gradle sync (5-10 min first time)
```

## Step 2: Update Backend URL
Open: `app/src/main/java/com/tappass/android/MainActivity.kt`

Find line ~127 and change:
```kotlin
// For Emulator:
val backendUrl = "http://10.0.2.2:3000"

// For Physical Device (find your IP first):
val backendUrl = "http://192.168.1.XXX:3000"
```

## Step 3: Connect Device
- **Emulator**: Tools → Device Manager → Create/Start emulator
- **Physical**: Enable USB Debugging → Connect via USB

## Step 4: Run App
- Click green ▶️ Run button
- Select your device
- App installs and launches!

## ✅ Done!
App should open and show "Ready to scan..."

**For detailed guide, see: HOW_TO_LOAD_APP.md**



