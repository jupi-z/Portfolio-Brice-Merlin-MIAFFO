import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './original-v2.css';
import './enhancements.css';

const root=document.getElementById('root')!;
const app=<React.StrictMode><App /></React.StrictMode>;
if(root.hasChildNodes())hydrateRoot(root,app);
else createRoot(root).render(app);
