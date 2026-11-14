# Dhan Setu — Mobile

React Native CLI app (not Expo), TypeScript, Android and iOS. It talks to the backend only
over HTTP (`/api/v1`); it never imports backend code. The backend is a separate project.

Stack: React Native 0.88, React Navigation (native stack), TanStack React Query, Redux Toolkit,
axios, react-hook-form + zod, react-native-keychain, lucide icons, Inter font.

## Layout

```
App.tsx                  providers: Redux, safe area, React Query, navigation
src/
  theme/                 colours, typography, spacing/radius/sizes, shadows  <- change the look here
  components/            shared UI: AppText, AppButton, AppTextInput, FormInput, Screen, Card,
                         ActionTile, ListRow, Banner, EmptyState, OtpInput, Avatar, IconBadge, ...
  navigation/            RootNavigator (switches auth/app), AuthStack, AppStack, types, theme
  api/                   axios client, React Query client, API response types
  config/env.ts          backend URL per platform
  services/              tokenStorage, onboardingStorage (keychain), razorpayCheckout
  store/                 Redux Toolkit: store, rootReducer, typed hooks, authSlice
  utils/                 apiError, money/phone formatting, countdown hook
  features/<feature>/    api.ts, hooks.ts, schemas.ts (zod), screens/
    auth/                Welcome, Login, Register, OtpVerify
    home/  profile/      Home dashboard, Profile + logout
    cards/ upi/ bbps/ transactions/   placeholders for the next phases
__tests__/               Jest + React Native Testing Library
android/app/src/main/assets/fonts/   Inter (SIL Open Font License)
ios/DhanSetu/Fonts/                  same Inter files for iOS (registered in Info.plist)
```

## Design rules

- Use components from `src/components`, never raw `Text`/`TextInput`/`Pressable` in screens.
- Use theme tokens (`colors`, `spacing`, `radius`, `typography`), never hex codes or numbers.
  Only `src/theme/` contains raw values.
- Text: `<AppText variant="h1|h2|h3|title|body|bodySmall|label|caption|overline|amount">`.
- Every screen is wrapped in `<Screen>` (safe areas, keyboard, padding, optional footer).
- Brand green `colors.brand` (#059669) is for icons and highlights; buttons and links use
  `colors.brandStrong` (#047857) so white text meets WCAG AA contrast.
- Money is integer paise (like the backend). Display with `formatPaise()`.

## Setup (macOS, Android)

1. Node 22+ (installed).
2. `brew install watchman`
3. Java 17: `brew install openjdk@17` (the build needs 17; Android Studio's bundled Java is newer).
4. Android Studio: `brew install --cask android-studio`, open it, finish the setup wizard,
   then Device Manager -> create a virtual device (e.g. Pixel 8, latest Android).
   The first build downloads the NDK and build-tools it needs.
5. Add to `~/.zshrc`, then open a new terminal:
   ```bash
   export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$JAVA_HOME/bin:$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
   ```
6. `npm install`

The first `npm run android` takes about 10 minutes (native compile); later builds are fast.
After changing `babel.config.js`, restart Metro with `npm start -- --reset-cache`.

## Setup (macOS, iOS)

1. Xcode from the App Store; open it once to install the iOS simulator.
2. CocoaPods: `brew install cocoapods`
3. `cd ios && pod install` (again whenever a native library is added or updated).
4. Open `ios/DhanSetu.xcworkspace` (not the .xcodeproj) if you use Xcode directly.

## Run

```bash
npm start            # terminal 1: Metro bundler
npm run android      # terminal 2: builds, installs and opens the app in the emulator
npm run ios          # or: iOS simulator (pick one with -- --simulator "iPhone 18 Pro")
```

The app expects the backend at `http://10.0.2.2:8000/api/v1` on the Android emulator (its
alias for your computer's localhost) and `http://localhost:8000/api/v1` on the iOS simulator
(see `src/config/env.ts`). Start the backend with `--host 0.0.0.0` (see the backend README).

## State (Redux Toolkit)

`<Provider store={store}>` wraps the whole app in `App.tsx`, so every screen can use it.

- Read state: `const user = useAppSelector(s => s.auth.user);`
- Change it: `const dispatch = useAppDispatch(); dispatch(logout());`
- Import both from `src/store`. Use them, not the plain `useSelector`/`useDispatch`, so
  state is typed.
- New state: write a slice in `src/store/` (or `features/<feature>/slice.ts`) and add it to
  `src/store/rootReducer.ts`.
- What goes where:
  - Redux holds app state, such as who is signed in.
  - React Query holds data from the backend, such as cards and payments.
  - The keychain holds tokens. Never put tokens in Redux.
- Tests: `renderWithProviders(<Screen />, { preloadedState })` from `testing/` gives each test
  its own store.

## KYC

Cards, UPI and bill payments need a verified KYC (Aadhaar and PAN from DigiLocker, plus a
live selfie, then approval by the Dhan Setu team in the admin portal).

- **Intro** (`KycIntroScreen`): opens right after sign-up for anyone who hasn't started KYC,
  with **Verify now** and **Skip for now**. It shows once per user on a device (remembered in
  the keychain by `services/kycPromptStorage.ts`).
- **Home banner**: until verified, shows the status (complete, finish, under review, or not
  approved with the reason) and opens the KYC screen.
- **KYC screen** (`KycScreen`): status, the three steps (done, next, to do) and the next
  action. Pull to refresh.
- **Profile**: a KYC row with the status.
- `useKyc()` (`GET /kyc`) keeps `user.kyc_status` in the store in step with the server.
- **DigiLocker** (`KycDigiLockerScreen`): says what's shared, then `POST /kyc/digilocker` and
  opens `consent_url` in the browser. The backend sends the browser back to
  `dhansetu://kyc/digilocker?status=...` (registered in `ios/DhanSetu/Info.plist` and
  `AndroidManifest.xml`). The link, or switching back to the app, only triggers a check:
  the app asks `GET /kyc/digilocker/{id}` how it went and never trusts the link's status.
  **I've finished** checks on demand; a refusal or timeout shows the reason with **Try again**.
- **Your details** (`KycDetailsScreen`): what DigiLocker shared (Aadhaar and PAN masked) to
  check, and the next step. If the PAN was missing or didn't match it says why and offers
  **Enter PAN**.
- **PAN** (`KycPanScreen`): checks the format like the backend (`schemas.ts`: a personal PAN,
  4th letter P), then `POST /kyc/pan`. A mismatch shows the server's reason; a match goes
  back to the details.
- Next: the live selfie and submit (KM3); until then **Continue** after PAN says it's coming.
  Locking Cards, UPI and Bills for unverified users is KM4.

Trying it locally: the backend's fake provider (`KYC_PROVIDER=fake`, `DEBUG=true`) opens a
stand-in DigiLocker page in Safari with Allow / Allow without PAN / Deny. iOS then asks
"Open in Dhan Setu?". The fake's PAN is `ABCPV1234F`. After changing `Info.plist` or the
manifest, rebuild the app (`npm run ios` / `npm run android`); a Metro reload isn't enough.
On the Android emulator, first run `adb reverse tcp:8000 tcp:8000`: the DigiLocker page's
address is `localhost:8000`, which inside the emulator means the emulator itself.

## Payments (Razorpay checkout)

Card payments use Razorpay's own checkout screen (`react-native-razorpay`), wrapped in
`src/services/razorpayCheckout.ts`. Card numbers and CVVs are typed into Razorpay's screen and
never reach this app or the backend.

- The app has no Razorpay keys. The backend returns the public key id with each order, and
  it switches between test and live mode.
- What checkout reports is only a hint: the app always sends it to the backend, which checks
  the signature with Razorpay before showing success.
- Checkout is native, so after installing or updating it, run `cd ios && pod install` and
  rebuild the app (not just reload Metro).

## Checks

Run before every commit:

```bash
npm run check        # typecheck + lint + tests
npm run format       # prettier
```

## Status

- Done (Prompt 4): design system, shared components, navigation (auth and app stacks),
  API client, keychain token storage, auth store, form validation mirroring the backend.
- Auth screens validate input but don't call the backend yet (Prompt 5).
