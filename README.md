# SickRSVPClient

This is the client application that connects SickRSVPServer.

## About

This client is a management application for RSVP's. Currently it is set to me and my girlfriends housewarming invitation.

### RSVP Page

This page has a flip photo section, that takes you down to a rsvp section which gets the persons name, email, and number of guests there bringing.
Once completed and verified with the server, the user will get a option to select a gift to bring. The max amount of gifts selectable is 5.
After that the user gets sent to a thank you page

### Thank You Page

This page just displays the users email and says thank you.

### Close Window

If the user did not have a token with the rsvp link or is not logged in as a admin they will get redirected to this page which tells them to close the window.

### Admin Pages

#### Guests

-   This displays the guests that have RSVP'd. You can delete or send them a invite via email. I did not send a invite right away for extra security.

#### Gifts

-   Here you can manage all the gifts you want people to give you. A gift is either claimed or needed. If a person has 5 gifts they will not be selected to be assigned a gift.

#### Users

-   This is where you have your users. You can send a link email to users that contains the link you can send to people that you want to rsvp.

## Connection to SickRSVPServer

The auth and data services are making api calls to the server with parameters, no queries. This is to minimize database attacks.

## Features

-   i18n Translations
    -   Currently just english and french
-   Firebase Analytics
-   JWT Token Verification with Axios
-   pinia State Stores
-   Google gtag
    -   Tag routes or errors
-   Capacitator to run on android and ios!
-   Theming made easy!

## Layout Architecture

Please place the layouts you want in /src/layouts

### /auth

This is where all auth layouts can be placed

### /main

This is where all the main layouts of the application are stored.

### Switching Layouts

Inside of src/router/routes.js you can change the main layout by changing the layout placed in the routes objet at the bottom.

## Set Up

### Firebase Notifications and Analytics

-   Create firebase project
-   Add app for ios and Android
-   Get google services json for each project
    -   Android: Put in /src-capacitor/android/app/google-services.json
    -   ios: Put in /src-capacitor/ios/App/App/GoogleServices-Info.plist

### Google Gtag

-   Get GOOGLE_MEASUREMENT_ID from Google Analytics
    -   Click admin settings and it should be on inner tab besise your project name
-   Add to src/boot/google-analytics.js

### Icon set up

-   Generate all icons neccesary for ios and android by running the command inside of /icongenie-command file.

## Npm Scripts

1. ```
   npm run lint
   ```

-   Check to see if there is any compiler issues

    #### Command

        eslint --ext .js,.vue ./

2. ```
   npm run test
   ```

-   Ensure that npm is installed and working

    #### Command

        echo \"No test specified\" && exit 0"

### Run Project

Make sure you have these photos:
/public/invite-back.jpg
/public/invite-front.png

Configure config.js to ensure the ports and urls are correct.

Ensure the server is running.

1. ```
   npm run dev
   ```

-   Run app in development enviorment

    #### Command

        npx quasar dev"

2.  ```
    npm run android
    ```

-   Run the android application in development enviorment
-   Ensure you have android studio installed
-   Ensure Firebase google-services.json is put in Client/src-capacitator/android/app
-   Ensure you have a android emulator installed as well, if not then connect your android phone via usb and ensure it is selected in android studio.
-   Once you run this command you will need to either press the run button in android studio or the debug button

    #### Command

        npx quasar dev -m capacitor -T android

3.  ```
    npm run ios
    ```

-   Run the ios application in development enviorment
-   ensure this is running on a mac
-   ensure you have xcode installed
-   ensure you have a emulator for a i device
-   ensure Firebase GoogleService-Info.plist is put in Client/src-capacitator/ios/App/App
-   Once you run this command you will need to press the run button in xcode
-   Recommended to run on actual device as views missing safe insets
-   Notifications don't work on emulators

    #### Command

        quasar dev -m capacitor -T ios

#### Tip

When running the project in android or ios mode you can get a better log information when you inspect with chrome developer tools.

### Building Project

Ensure to run "npm install" to install all modules.

Don't use these often as they bump the package.json version

1.  ```
    npm run build-ios
    ```

-   Ensure you are not running the ios project when running this command
-   Bumps the package.json version
-   Sets up build for ios deployment

    #### Command

        quasar build -m capacitor -T ios --ide

2.  ```
    npm run build-android
    ```

-   Ensure you are not running the android project when running this command
-   Bumps the package.json version
-   Sets up build for ios deployment

    #### Command

        quasar build -m capacitor -T android --ide

3.  ```
    npm run build-www
    ```

-   Ensure you are not running any other projects
-   Bumps the package.json version
-   Creates a www folder in capacitor

    #### Command

         quasar build -m capacitor -T android --skip-pkg

## Publishing Project

### Web Application

    npm run build-spa

-   Where your server is running:
    -   Copy all files inside of the /dist/spa folder
    -   Paste into the serving folder, overwrite everything

### iOS Android Mobile Web Application

    npm run build-capacitor

-   Open up the folder in /src-capacitator/www
    -   Create a zip folder from all content and label it dist.zip
    -   This Goes in the version folder where your APP_VERSION_DIRECTORY env variable is pointing to
-   Copy all files into the serving folder for your web version to be updated

## Publish For Testing

For more help, view the example videos

### iOS Testflight

-   Update build version in xcode to package.json version

    npm run build-ios

-   Archive project in xcode
-   View archived project and deploy it
-   Go to test flight in apple developer console
-   Complete uploading to testflight there

### Android Open Testing

-   Bump version in /src-capacitor/android/app/build.gradle

    npm run build-android

-   Generate signed apk's in android studio
-   Ensure you have a sha key and store it in a safe location. Make a duplicate and store it in a usb
-   Go to google play store open testing and add the apk
-   Follow any rules there
