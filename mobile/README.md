# SuperTech Mobile App (Capacitor)

Native **Android** and **iOS** wrappers for the SuperTech marketplace, built with
[Capacitor](https://capacitorjs.com/). The app loads the live site
(`https://www.supertech.africa`) inside a native shell, so **content stays in sync
with the website automatically** — you only need to ship a new app build when you
change native config (icon, splash, plugins, app version).

- **App name:** SuperTech
- **App ID (bundle id):** `africa.supertech.app`
- **Loads:** `https://www.supertech.africa`

---

## 1. Prerequisites

| To build | You need |
|---|---|
| **Android** | [Node 18+](https://nodejs.org), [Android Studio](https://developer.android.com/studio) (includes the Android SDK), JDK 17 |
| **iOS** | A **Mac** with [Xcode](https://developer.apple.com/xcode/) + [CocoaPods](https://cocoapods.org) (`sudo gem install cocoapods`). iOS **cannot** be built on Windows/Linux. |

> No Mac? Build iOS in the cloud with **[Codemagic](https://codemagic.io)**,
> **[Ionic Appflow](https://ionic.io/appflow)**, or GitHub Actions `macos` runners.
> They produce the `.ipa` and can upload to App Store Connect for you.

You'll also need (you already have these):
- A **Google Play Developer** account ($25 one-time)
- An **Apple Developer** account ($99/year)

---

## 2. One-time setup

From this `mobile/` folder:

```bash
npm install

# Add the native platforms (creates android/ and ios/ folders).
npm run add:android       # Windows/Mac/Linux
npm run add:ios           # Mac only

# Brand the Android launcher icon + splash (uses the web project's sharp).
npm run icons:android

# Copy config + web assets into the native projects.
npm run sync
```

> **iOS icons/splash:** generate them in Xcode (drag the 1024² `resources/icon.png`
> into the asset catalog) or, on a Mac, install `@capacitor/assets`
> (`npm i -D @capacitor/assets`) and run `npx capacitor-assets generate`.
> `@capacitor/assets` is intentionally **not** a dependency here because its
> `sharp` binary download fails behind some corporate TLS proxies; the Android
> script above sidesteps that by reusing the web project's already-installed sharp.

The `android/` and `ios/` folders are **git-ignored** because they're generated and
machine-specific — anyone can recreate them with the commands above.

---

## 3. Run locally / debug

```bash
npm run open:android      # opens Android Studio -> press Run
npm run open:ios          # opens Xcode (Mac) -> press Run
```

Or directly on a connected device/emulator:

```bash
npm run run:android
npm run run:ios
```

---

## 4. Ship to Google Play (Android)

1. `npm run open:android` to open the project in Android Studio.
2. Bump the version: in `android/app/build.gradle` increase `versionCode` (integer,
   must go up every upload) and `versionName` (e.g. `1.0.0`).
3. **Build → Generate Signed Bundle / APK → Android App Bundle (.aab)**.
   - First time: **create a keystore** and store it safely (you reuse it for every
     future update — losing it means you can't update the app). Or enable
     **Play App Signing** and let Google manage the key.
4. Go to the [Play Console](https://play.google.com/console) → create the app →
   **Production → Create release** → upload the `.aab`.
5. Fill in the store listing (see the checklist below) and submit for review.

---

## 5. Ship to the App Store (iOS — Mac required)

1. `npm run open:ios` to open `ios/App/App.xcworkspace` in Xcode.
2. Select the **App** target → **Signing & Capabilities** → choose your Apple
   Developer **Team** (Xcode auto-manages signing).
3. Set the version + build number (General tab). Build number must increase every
   upload.
4. Pick **Any iOS Device (arm64)** as the target, then **Product → Archive**.
5. In the Organizer window → **Distribute App → App Store Connect → Upload**.
6. In [App Store Connect](https://appstoreconnect.apple.com) create the app
   (bundle id `africa.supertech.app`), attach the build, fill the listing, and
   submit for review.

> ⚠️ **Apple guideline 4.2 (minimum functionality).** Apple sometimes rejects apps
> that are *only* a website in a webview. This shell already adds native splash,
> status bar, and external-link handling. To be safe, also enable at least one real
> native capability before submitting — **Push Notifications** is the easiest and
> most valuable (see "Recommended next step" below). Emphasize app-specific value
> (offline cart, notifications, home-screen presence) in the review notes.

---

## 6. Updating the app later

- **Website/content changes** (products, prices, pages, most features): nothing to
  do — the app loads the live site, so users see updates immediately.
- **Native changes** (app icon, splash, version bump, new plugin, OS requirement):
  edit config → `npm run sync` → rebuild and upload a new store release.

---

## 7. Store listing checklist

You'll need these for **both** stores:

- [ ] App name: **SuperTech**
- [ ] Short + full description (reuse the site's marketing copy)
- [ ] **Icon** 512×512 (Play) / 1024×1024 (App Store) — generated in `resources/`
- [ ] **Screenshots** — phone (and tablet for Play). Capture from the running app.
- [ ] **Feature graphic** 1024×500 (Play only)
- [ ] **Privacy policy URL** (required by both) — add a `/privacy` page on the site
- [ ] Category: **Shopping**
- [ ] Content rating questionnaire (Play) / age rating (App Store)
- [ ] Data safety form (Play) / App privacy "nutrition label" (App Store)
- [ ] Support email + website URL

---

## 8. Recommended next step: Push notifications

To strengthen App Store approval and re-engage shoppers, add Firebase Cloud
Messaging via `@capacitor/push-notifications`:

```bash
npm install @capacitor/push-notifications
npm run sync
```

Then set up a Firebase project (Android `google-services.json`, iOS APNs key in
App Store Connect). Ask and I can wire the registration + a send endpoint on the
website.

---

## Files in this folder

| File | Purpose |
|---|---|
| `capacitor.config.ts` | App id, name, and the live URL the shell loads |
| `resources/icon.png` | 1024² source icon for `npm run assets` |
| `resources/splash.png` | 2732² source splash for `npm run assets` |
| `www/index.html` | Branded offline/loading fallback |
| `android/`, `ios/` | Generated native projects (git-ignored) |
