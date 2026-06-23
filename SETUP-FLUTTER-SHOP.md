# Run the REAL TI360-Application shop inside this website

The website's Shop section automatically runs your actual Flutter app (same UI,
same Firebase data — Orbilit Technology, Neptune Lights, live negotiations)
once you install its web build. Until then it shows the built-in web rebuild.

## One-time setup (Git Bash, on your PC)

    # 1. Build the Flutter app for web
    cd /c/Users/Ruchitha/TI360-Application-
    flutter build web --base-href /ti360app/

    # 2. Copy the build into this website
    rm -rf /c/Users/Ruchitha/Downloads/TerraInfra360-complete/rakshithapm-new-web/public/ti360app
    mkdir -p /c/Users/Ruchitha/Downloads/TerraInfra360-complete/rakshithapm-new-web/public/ti360app
    cp -r build/web/* /c/Users/Ruchitha/Downloads/TerraInfra360-complete/rakshithapm-new-web/public/ti360app/

    # 3. Run the website
    cd /c/Users/Ruchitha/Downloads/TerraInfra360-complete/rakshithapm-new-web
    npm run dev

Open http://localhost:3000 → Shop. That IS your app now.

Re-run steps 1-2 whenever you update the Flutter app.
If `flutter` is not found, install it from https://docs.flutter.dev/get-started/install/windows
