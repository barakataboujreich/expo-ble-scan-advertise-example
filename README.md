# expo-ble-scan-advertise-example
Expo example for ble scanning and advertising

## Getting started
```
npm install react-native-ble-advertise
npm install --save react-native-ble-manager
```

## EAS Setup
sign up at https://expo.dev/signup

# Install the latest EAS CLI
`npm install -g eas-cli`

# Log in to your Expo account
`eas login`

# Configure the project
`eas build:configure`

follow the steps in the prompt
## Android Setup

To add permissions in Expo when we don't have direct access to Android manifest files due to using Expo, we can include
the necessary permissions in the `app.json` under the 'android' key.

```json
"android": {
  ...
  "permissions": [
    "android.permission.BLUETOOTH",
    "android.permission.BLUETOOTH_ADMIN",
    "android.permission.BLUETOOTH_ADVERTISE"
    "android.permission.ACCESS_COARSE_LOCATION",
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.BLUETOOTH_SCAN",
    "android.permission.BLUETOOTH_CONNECT",
  ],
  ...
},
```

After adding a library, we can't run the application using the 'expo start' command anymore. Instead, we need to build
a development version of the application that we'll use in conjunction with the Expo application.

### EAS: Building the application
`eas build --profile development --platform android`

follow any step shown in the prompt. set a correct app package id. generate a new Android keystore, or set the path to the existing key.keystore. for me the eas project id was updated automatically in app.json
if eas project id was not automatically updated, go to the projects tab in https://expo.dev/ click on your project and copy the ID. Paste the id in 
```json
"extra": {
  "eas": {
    "projectId": "<your-project-id>"
  }
}
```
### EAS: Running the application
After building the application, go to the Builds tab in https://expo.dev/accounts/<account-name>/projects/<project-name>/builds click on the latest build download the apk to a device you wish to run the app on.
install the apk on the specified device. After the apk successfully installed run
`npx expo start --dev-client`

a QR code will be visible, scan it with Expo app, and your application should automatically launch
## iOS Setup
i do not have access right now to a mac to test and launch. It should be straight forward from the EAS documentation. [EAS Setup](https://docs.expo.dev/build/setup/)

### Find the RN code in App.js


