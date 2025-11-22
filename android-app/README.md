# TapPass Android App

Android NFC application for TapPass built with Kotlin.

## Features

- NFC tag reading and detection
- Tag registration with backend API
- Simple and intuitive UI

## Requirements

- Android Studio Hedgehog (2023.1.1) or later
- Android SDK 24 (Android 7.0) or higher
- NFC-enabled Android device

## Setup

1. Open the project in Android Studio
2. Sync Gradle files
3. Connect an NFC-enabled Android device or use an emulator with NFC support
4. Build and run the app

## Configuration

Update the backend URL in `MainActivity.kt`:
```kotlin
val backendUrl = "http://your-backend-url:3000/register"
```

For local development, use `10.0.2.2` instead of `localhost` when running on an emulator.

## NFC Permissions

The app requires NFC permissions which are declared in `AndroidManifest.xml`. The app will prompt users to enable NFC if it's disabled.

## Building

```bash
./gradlew assembleDebug
```

## License

MIT

