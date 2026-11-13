import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initWebVitalsRUM } from './utils/webVitals';

// Initialize Core Web Vitals RUM monitoring
initWebVitalsRUM();

createRoot(document.getElementById('root')!).render(<App />);
