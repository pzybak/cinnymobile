# Cinny Mobile

Android and iOS builds of Cinny, wrapped with [Capacitor](https://capacitorjs.com/).
The web app is unchanged; native code lives in `android/`, `ios/` and `src/native/`.

## Android (debug build on your phone)

Requires Node (see `.node-version`), JDK 21 and Android Studio (or the Android SDK
with `ANDROID_HOME` set).

```sh
npm ci
npm run android        # web build + cap sync + install/run on a connected device
# or
npm run build:android  # web build + cap sync android only
npm run android:open   # open the project in Android Studio
```

Debug builds can be inspected from desktop Chrome at `chrome://inspect`.
CI builds a debug APK on every push to `mobile` (see the "Android build" workflow artifacts).

## iOS (later)

The `ios/` project is generated and kept in sync, but it needs a Mac with Xcode:

```sh
npm run ios:open
```

## Layout

- `capacitor.config.ts`: shared config (app ID, name, schemes)
- `src/native/platform.ts`: `isNative()`, `isAndroid()`, `isIOS()`
- `src/native/index.ts`: native-only setup (back button); a no-op on the web

Keep native checks behind `src/native/` so upstream rebases stay small.
