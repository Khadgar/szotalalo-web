/**
 * App entrypoint.
 *
 * Bootstraps:
 *   - Mantine UI (with persisted light/dark/auto color scheme)
 *   - i18next (side-effect import, configures the global instance)
 *   - The HashRouter (see ./router) that owns all app routes
 *
 * Everything else is composed under <Router /> in App.tsx.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, localStorageColorSchemeManager } from '@mantine/core';
import '@mantine/core/styles.css';
import './i18n';
import Router from './router';

// Persist the user's theme choice in localStorage so it survives reloads
// and overrides the OS-level prefers-color-scheme when set explicitly.
const colorSchemeManager = localStorageColorSchemeManager({ key: 'szotalalo-color-scheme' });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="auto" colorSchemeManager={colorSchemeManager}>
      <Router />
    </MantineProvider>
  </React.StrictMode>,
);
