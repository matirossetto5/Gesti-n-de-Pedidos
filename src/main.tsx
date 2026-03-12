import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import 'whatwg-fetch';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
