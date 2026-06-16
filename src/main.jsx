import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { migrateStorage } from './storage.js';
import App from './app.jsx';

// Must run before App mounts: its initial state reads the namespaced keys.
migrateStorage();

// Lock to portrait on devices/browsers that support it (Chrome Android, PWA).
if (screen.orientation?.lock) {
  screen.orientation.lock('portrait').catch(() => {});
}

createRoot(document.getElementById('root')).render(<App />);
