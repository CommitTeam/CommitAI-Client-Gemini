export default () => ({
    expo: {
        name: "CommitAI",
        scheme: "commitai",
        slug: "commitaiTeam",
        version: "2.0.2",
        icon: "./assets/Icon.png",
        sdkVersion: "52.0.0",
        owner: "commitai",
        userInterfaceStyle: "automatic",
        orientation: "portrait",
        platforms: ["ios", "android"],
        splash: {
            image: "./assets/splash-static.png",
            contentFit: "contain",
            backgroundColor: "#FFFFFF"
        },
        ios: {
            bundleIdentifier: "com.commit.ai.commit.ai",
            supportsTablet: false,
            newArchEnabled: true,
            splash: {
                image: "./assets/splash-static.png",
                contentFit: "contain",
                backgroundColor: "#FFFFFF"
            },
            infoPlist: {
                ITSAppUsesNonExemptEncryption: false,
                NSCameraUsageDescription: "This app requires to enable workout tracking and live video streaming",
                NSContactsUsageDescription: "CommitAI uses your contacts to help you invite friends to challenges and find teammates."
            },
            associatedDomains: ["applinks:icommit.ai"]
        },
        android: {
            package: "com.commit.ai.commit.ai",
            newArchEnabled: true,
            splash: {
                image: "./assets/splash-static.png",
                contentFit: "contain",
                backgroundColor: "#FFFFFF"
            },
            permissions: ["CAMERA"],
            adaptiveIcon: {
                foregroundImage: "./assets/Icon.png",
                backgroundColor: "#FFFFFF"
            },
            softwareKeyboardLayoutMode: "pan",
            intentFilters: [
                {
                    action: "VIEW",
                    category: ["BROWSABLE", "DEFAULT"],
                    data: [
                        { scheme: "commitai" },
                        { scheme: "https", host: "icommit.ai" }
                    ]
                }
            ]
        },
        assetBundlePatterns: ["**/*"],
        plugins: [
            "expo-asset",
            "expo-font",
            "expo-secure-store",
            "expo-camera",
            [
                "expo-video",
                {
                    supportsPictureInPicture: true
                }
            ]
        ],
        extra: {
            eas: {
                projectId: "87f312e5-3696-47d3-b087-59934f494e16"
            }
        },
        updates: {
            enabled: true,
            url: "https://u.expo.dev/87f312e5-3696-47d3-b087-59934f494e16",
            checkAutomatically: "ON_LOAD",
            fallbackToCacheTimeout: 0
        },
        runtimeVersion: {
            policy: "appVersion"
        },
        web: { bundler: "metro" }
    }
});