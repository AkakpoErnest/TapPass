# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Keep NFC related classes
-keep class android.nfc.** { *; }

# Keep OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**

