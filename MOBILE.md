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
It signs with the debug keystore in the `ANDROID_DEBUG_KEYSTORE` secret (base64), so builds
install over each other. For local builds that match, set `CINNY_DEBUG_KEYSTORE` to the same file.

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

## Known gaps

Left over from the touch and mobile UX work, to come back to.

Touch UX:

- **Not tested on iOS.** Long-press menus, the swipe drawer and the space
  long-press menu avoid Android-only events on purpose, but nothing has run
  on an iPhone yet. The swipe drawer is the main way back from a room there,
  since iOS has no back button.
- **PDF pinch and double-tap zoom** (`src/app/hooks/usePinchZoom.ts`) were
  never tried on a device, for lack of a PDF in a test room.
- **Space long-press opens on release.** Android turns a long-press on a
  space icon into a native drag, so its menu opens when the drag is let go
  where it began, not at the half-second mark like other menus
  (`SpaceTabs.tsx`, `useDraggableItem`). Reordering spaces by drag was only
  tried with a single space.
- **Swipe drawer history.** A completed swipe navigates like the back arrow,
  so each swipe adds a history entry for Android back to walk through. The
  room lists also stay mounted under the open room on phones
  (`src/app/components/mobile-drawer/`), which costs some memory.
- **Header buttons and avatars** are 36-40px, below the 44-48px touch
  guideline. Reaction chips, composer buttons and names were enlarged.

Other mobile gaps:

- **Reloading a room page fails.** Capacitor's Android file server treats a
  path whose last segment has a dot (such as `...:matrix.org`) as a missing
  file and shows "Webpage not available". Navigation inside the app is fine;
  only a full page load breaks.
- **The "Connecting..." banner** shows for a while after every launch. Not
  looked into.
- **No push notifications.** The only pusher is email.
- **The access token is in `localStorage`**, not the Android Keystore or iOS
  Keychain.
- **IndexedDB can be evicted**, and the client stops syncing while the app is
  in the background.
- **Downloads use file-saver**, which does nothing useful in the WebView;
  they need native save and share.
- **Element Call** needs camera and microphone permissions wired up.
- **Authenticated media** relies on the service worker, which WKWebView
  doesn't run under `capacitor://`, so images won't load on iOS as is.
