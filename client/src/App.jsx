import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
// import './App.css';
import './index.css'; // Reset styles
import './pages/layout.css'; // Custom styles

// Lazy-loaded pages
const Home = lazy(() => import('./pages/home'));
const Upload = lazy(() => import('./pages/upload'));
const Analyze = lazy(() => import('./pages/analyze'));
const Analysis = lazy(() => import('./pages/analysis'));
const Predictions = lazy(() => import('./pages/predictions'));
const NotFound = lazy(() => import('./pages/NotFound'));

const App = () => {
  return (
    <Suspense fallback={<div className="text-white text-center p-10">Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/predictions" element={<Predictions />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;