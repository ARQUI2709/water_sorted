import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { migrateStorage } from './storage.js';
import App from './app.jsx';

// Must run before App mounts: its initial state reads the namespaced keys.
migrateStorage();

createRoot(document.getElementById('root')).render(<App />);
