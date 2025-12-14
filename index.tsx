import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';

// Attempt to get the key from the environment.
// If missing, we will run the app in a "no-auth" mode to prevent crashes.
const PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_KEY;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

if (PUBLISHABLE_KEY) {
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App enableAuth={true} />
      </ClerkProvider>
    </React.StrictMode>
  );
} else {
  console.warn("No valid Clerk Publishable Key found. Authentication features will be disabled.");
  root.render(
    <React.StrictMode>
      <App enableAuth={false} />
    </React.StrictMode>
  );
}