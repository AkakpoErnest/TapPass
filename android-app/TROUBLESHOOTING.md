# 🔧 Android App Troubleshooting Guide

## Common Errors and Fixes

### ❌ Error: "Gradle sync failed"

**Fix 1: Clean and Rebuild**
```bash
cd android-app
./gradlew clean
./gradlew build
```

**Fix 2: Invalidate Caches**
- Android Studio: `File` → `Invalidate Caches` → `Invalidate and Restart`

**Fix 3: Check Gradle Version**
- Ensure you have Gradle wrapper or update `gradle-wrapper.properties`

### ❌ Error: "SDK location not found"

**Fix: Create local.properties**
Create file: `android-app/local.properties`
```properties
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

**Find your SDK path:**
- Android Studio: `Preferences` → `Appearance & Behavior` → `System Settings` → `Android SDK`
- Copy the "Android SDK Location" path

### ❌ Error: "Cannot resolve symbol"

**Fix 1: Sync Gradle**
- Click the elephant icon (🔄) or `File` → `Sync Project with Gradle Files`

**Fix 2: Check Dependencies**
- Ensure all dependencies in `build.gradle.kts` are correct
- Check internet connection (dependencies download from Maven)

**Fix 3: Invalidate Caches**
- `File` → `Invalidate Caches` → `Invalidate and Restart`

### ❌ Error: "Build failed" or "Compilation error"

**Fix 1: Check Kotlin Version**
- Ensure Kotlin version matches in `build.gradle.kts`

**Fix 2: Check Java Version**
- Android Studio: `File` → `Project Structure` → `SDK Location`
- Ensure Java 17+ is selected

**Fix 3: Update Dependencies**
```bash
cd android-app
./gradlew --refresh-dependencies
```

### ❌ Error: "ViewBinding not found"

**Fix: Ensure viewBinding is enabled**
In `app/build.gradle.kts`, check:
```kotlin
buildFeatures {
    viewBinding = true
}
```

### ❌ Error: "Missing Gradle wrapper"

**Fix: Generate Gradle wrapper**
```bash
cd android-app
gradle wrapper --gradle-version 8.0
```

Or download from: https://gradle.org/releases/

### ❌ Error: "App won't install on device"

**Fix 1: Uninstall old version**
- Settings → Apps → TapPass → Uninstall

**Fix 2: Check USB Debugging**
- Settings → Developer Options → USB Debugging (ON)

**Fix 3: Check Storage**
- Ensure device has enough storage space

### ❌ Error: "Network security config" or "Cleartext traffic"

**Fix: Add network security config**
Create: `app/src/main/res/xml/network_security_config.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">192.168.1.0</domain>
    </domain-config>
</network-security-config>
```

Then in `AndroidManifest.xml`, add to `<application>`:
```xml
android:usesCleartextTraffic="true"
android:networkSecurityConfig="@xml/network_security_config"
```

### ❌ Error: "NFC permission denied"

**Fix: Check AndroidManifest.xml**
Ensure these are present:
```xml
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="true" />
```

## Quick Fix Checklist

1. ✅ **Gradle Sync**
   - Click sync button (🔄) or `File` → `Sync Project with Gradle Files`

2. ✅ **Clean Build**
   - `Build` → `Clean Project`
   - `Build` → `Rebuild Project`

3. ✅ **Invalidate Caches**
   - `File` → `Invalidate Caches` → `Invalidate and Restart`

4. ✅ **Check SDK**
   - `File` → `Project Structure` → Check SDK location

5. ✅ **Update Gradle**
   - `File` → `Settings` → `Build, Execution, Deployment` → `Gradle`
   - Use Gradle wrapper

6. ✅ **Check Logs**
   - View → Tool Windows → `Build` (for build errors)
   - View → Tool Windows → `Logcat` (for runtime errors)

## Still Not Working?

### Get Error Details

1. **Check Build Output**
   - View → Tool Windows → `Build`
   - Look for red error messages
   - Copy the full error text

2. **Check Logcat**
   - View → Tool Windows → `Logcat`
   - Filter by "Error" or your app package name

3. **Check Gradle Console**
   - View → Tool Windows → `Gradle`
   - Look for sync/build errors

### Common Error Messages

**"Could not resolve all dependencies"**
- Check internet connection
- Try: `./gradlew --refresh-dependencies`

**"Unsupported class file major version"**
- Update Java version to 17+
- Android Studio: `File` → `Project Structure` → `SDK Location`

**"Duplicate class found"**
- Clean build: `Build` → `Clean Project`

**"Manifest merger failed"**
- Check `AndroidManifest.xml` for duplicate entries
- Check for conflicting dependencies

## Need More Help?

1. **Check the exact error message** in Build output
2. **Copy the full error** (right-click → Copy)
3. **Check Android Studio version** (should be Hedgehog 2023.1.1+)
4. **Check Java version** (should be 17+)

## Quick Commands

```bash
# Navigate to android-app
cd android-app

# Clean build
./gradlew clean

# Build debug APK
./gradlew assembleDebug

# Check for issues
./gradlew tasks

# Update dependencies
./gradlew --refresh-dependencies
```

---

**Share the exact error message for more specific help!**



