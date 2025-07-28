import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const originalToLocaleString = Number.prototype.toLocaleString;
Number.prototype.toLocaleString = function (locale?: string, options?: Intl.NumberFormatOptions) {
  return originalToLocaleString.call(this, locale ?? 'es-CO', options);
};
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
