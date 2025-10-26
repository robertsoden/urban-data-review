<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1BVifhcsYXK8N2Hs1HeqDtUZ7vaJkQru1

## Run Locally

**Prerequisites:**  Node.js, Firebase project


1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Set the `GEMINI_API_KEY` to your Gemini API key
   - Add your Firebase credentials (see Firebase Setup below)

3. Run the app:
   ```bash
   npm run dev
   ```

## Firebase Setup

This application uses Firebase Firestore for data persistence. To configure Firebase:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Create a Firestore database in your project
3. Go to Project Settings > General > Your apps
4. Register a web app or select an existing one
5. Copy the Firebase configuration values
6. Add them to your `.env` file:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

**Note:** Without Firebase configuration, the app will use mock data only and import/export features will not work.
