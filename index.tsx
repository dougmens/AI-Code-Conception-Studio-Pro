import React from 'https://esm.sh/react@19.1.0';
import { createRoot } from 'https://esm.sh/react-dom@19.1.0/client';
import App from './App.tsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
