# CommitAI Mobile 📱

React Native (Expo) version of the CommitAI fitness app - converted from the web version.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (for testing)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

### Running on Device

1. **iOS/Android Simulator**: Press `i` for iOS or `a` for Android in the terminal
2. **Physical Device**: Scan the QR code with Expo Go app

## 📁 Project Structure

```
CommitAI-Mobile/
├── App.tsx                 # Main entry point
├── app.json                # Expo configuration
├── package.json            # Dependencies
├── tailwind.config.js      # NativeWind (Tailwind) config
├── tsconfig.json           # TypeScript config
│
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Base components (Button, Card, etc.)
│   │   ├── feed/           # Feed-related components
│   │   └── onboarding/     # Auth/onboarding components
│   │
│   ├── screens/            # Screen components
│   ├── navigation/         # React Navigation setup
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API & business logic
│   │   ├── storage.ts      # AsyncStorage wrapper
│   │   ├── backend.ts      # Mock backend service
│   │   └── geminiService.ts # Gemini AI integration
│   │
│   ├── utils/              # Utility functions
│   │   ├── poseLogic.ts    # Exercise analysis
│   │   └── helpers.ts      # General helpers
│   │
│   ├── types/              # TypeScript definitions
│   ├── constants/          # App-wide constants
│   └── assets/             # Images, fonts, etc.
│
└── assets/                 # Expo assets (icon, splash)
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and add your API keys:

```bash
cp .env.example .env.local
```

Required variables:
- `EXPO_PUBLIC_GEMINI_API_KEY` - Google Gemini API key for AI features

### Customization

- **Colors**: Edit `tailwind.config.js` and `src/constants/index.ts`
- **Navigation**: Modify `src/navigation/AppNavigator.tsx`
- **Mock Data**: Update `src/constants/index.ts`

## 📱 Features

### Implemented (Phase 1)
- ✅ Project setup & configuration
- ✅ TypeScript types
- ✅ Navigation structure (Stack + Tabs)
- ✅ AsyncStorage service (replacing localStorage)
- ✅ Backend service (mock API)
- ✅ Gemini AI service
- ✅ Pose logic utilities
- ✅ Constants & theming

### Coming Soon (Phase 2+)
- 🔜 Login & Authentication UI
- 🔜 Home Feed Screen
- 🔜 Profile Screen
- 🔜 Live Workout with Camera
- 🔜 Leaderboard
- 🔜 Marketplace
- 🔜 Notifications

## 🧪 Testing

```bash
# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📦 Building

```bash
# Build for production (requires EAS)
npx eas build --platform ios
npx eas build --platform android
```

## 🔄 Conversion Notes

This app was converted from a React web app. Key changes:

| Web | React Native |
|-----|--------------|
| `<div>` | `<View>` |
| `<span>`, `<p>` | `<Text>` |
| `<img>` | `<Image>` (expo-image) |
| `localStorage` | `AsyncStorage` |
| CSS/Tailwind | NativeWind + StyleSheet |
| React Router | React Navigation |
| MediaPipe | expo-camera + TensorFlow.js (TBD) |

## 📄 License

MIT

---

Built with ❤️ and converted by Claude
