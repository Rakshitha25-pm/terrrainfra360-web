# TerraInfra360

Web app for the TerraInfra360 construction & real‑estate platform. Built with React 19, Vite, Tailwind CSS, and Firebase.

## Prerequisites

- Node.js 18+ and npm

## Installation

```bash
npm install
```

## Run

```bash
npm run dev
```

Runs at **http://localhost:3000**. The Firebase config is built in, so it works out of the box.

## Build

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build
```

## Configuration (optional)

To use your own Firebase project, create a `.env.local` file in the project root:

```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
