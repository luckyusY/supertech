# SuperTech Flutterwave Dart App

Small Flutter app that opens Flutterwave Standard checkout.

## Requirements

- Flutter SDK installed
- Flutterwave business account
- Flutterwave public key
- A backend endpoint for final transaction verification

The app uses `flutterwave_standard: ^1.1.0`, which Flutterwave lists for Android/iOS checkout. The package docs say to use a public key in the mobile app and verify the returned transaction on your server before fulfilling the order.

## Run

```bash
cd flutterwave_dart_app
flutter pub get
flutter run --dart-define=FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-public-key
```

With backend verification:

```bash
flutter run \
  --dart-define=FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-public-key \
  --dart-define=PAYMENT_VERIFY_URL=https://supertech.africa/api/payments/flutterwave/verify
```

## Important

- Never put your Flutterwave secret key in this app.
- Use the public key only.
- Generate and store transaction references on your server for production.
- Verify `transactionId` or `txRef`, amount, currency, and status on your backend before delivering products or marking an order as paid.

## Build

```bash
flutter build apk --release --dart-define=FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_LIVE-your-public-key
```

For Play Store:

```bash
flutter build appbundle --release --dart-define=FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_LIVE-your-public-key
```
