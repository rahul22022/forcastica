// // src/App.js

// import React, { Suspense, lazy } from 'react';
// import { Routes, Route } from 'react-router-dom';
// // import { AnimatePresence } from "framer-motion";
// import { motion, AnimatePresence } from 'framer-motion';


// const Home = lazy(() => import('./pages/home'));
// const Upload = lazy(() => import('./pages/upload'));
// const Analyze = lazy(() => import('./pages/analyze'));
// const Analysis = lazy(() => import('./pages/analysis'));
// const NotFound = lazy(() => import('./pages/NotFound')); // 404 fallback page



// const App = () => {
//   return (
//     <AnimatePresence mode="wait">
//       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//       <Suspense fallback={<div className="text-white text-center p-10">Loading...</div>}>
//         <Routes>
//           <Route path="/home" element={<Home />} />
//           <Route path="/upload" element={<Upload />} />
//           <Route path="/analyze" element={<Analyze />} />
//           <Route path="/analysis" element={<Analysis />} />
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </Suspense>
//       </motion.div>
//      </AnimatePresence>
//   );
// };


// export default App;


// App.jsx
// import React, { Suspense, lazy } from 'react';
// import { Routes, Route, useLocation } from 'react-router-dom';
// import { AnimatePresence, motion } from 'framer-motion';

// const Home = lazy(() => import('./pages/home'));
// const Upload = lazy(() => import('./pages/upload'));
// const Analyze = lazy(() => import('./pages/analyze'));
// const Analysis = lazy(() => import('./pages/analysis'));
// const NotFound = lazy(() => import('./pages/NotFound'));

// const App = () => {
//   const location = useLocation(); // 🔥 Required to track routing changes

//   return (
//     <AnimatePresence mode="wait">
//       <Suspense fallback={<div className="text-white text-center p-10">Loading...</div>}>
//         <Routes location={location} key={location.pathname}>
//           <Route
//             path="/home"
//             element={
//               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//                 <Home />
//               </motion.div>
//             }
//           />
//           <Route
//             path="/upload"
//             element={
//               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//                 <Upload />
//               </motion.div>
//             }
//           />
//           <Route
//             path="/analyze"
//             element={
//               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//                 <Analyze />
//               </motion.div>
//             }
//           />
//           <Route
//             path="/analysis"
//             element={
//               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//                 <Analysis />
//               </motion.div>
//             }
//           />
//           <Route
//             path="*"
//             element={
//               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//                 <NotFound />
//               </motion.div>
//             }
//           />
//         </Routes>
//       </Suspense>
//     </AnimatePresence>
//   );
// };

// export default App;


// // App.jsx
// import React, { Suspense, lazy } from 'react';
// import { Routes, Route, useLocation } from 'react-router-dom';
// import { AnimatePresence, motion } from 'framer-motion';

// const Home = lazy(() => import('./pages/home'));
// const Upload = lazy(() => import('./pages/upload'));
// const Analyze = lazy(() => import('./pages/analyze'));
// const Analysis = lazy(() => import('./pages/analysis'));
// const NotFound = lazy(() => import('./pages/NotFound'));

// const AnimatedRoutes = () => {
//   const location = useLocation();

//   return (
//     <AnimatePresence mode="wait">
//       <Routes location={location} key={location.pathname}>
//         <Route
//           path="/home"
//           element={
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//               <Home />
//             </motion.div>
//           }
//         />
//         <Route
//           path="/upload"
//           element={
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//               <Upload />
//             </motion.div>
//           }
//         />
//         <Route
//           path="/analyze"
//           element={
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//               <Analyze />
//             </motion.div>
//           }
//         />
//         <Route
//           path="/analysis"
//           element={
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//               <Analysis />
//             </motion.div>
//           }
//         />
//         <Route
//           path="*"
//           element={
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//               <NotFound />
//             </motion.div>
//           }
//         />
//       </Routes>
//     </AnimatePresence>
//   );
// };

// const App = () => {
//   return (
//     <Suspense fallback={<div className="text-white text-center p-10">Loading...</div>}>
//       <AnimatedRoutes />
//     </Suspense>
//   );
// };

// export default App;


// import React, { Suspense, lazy } from 'react';
// import { Routes, Route, useLocation } from 'react-router-dom';
// import { AnimatePresence } from 'framer-motion';

// const Home = lazy(() => import('./pages/home'));
// const Upload = lazy(() => import('./pages/upload'));
// const Analyze = lazy(() => import('./pages/analyze'));
// const Analysis = lazy(() => import('./pages/analysis'));
// const NotFound = lazy(() => import('./pages/NotFound'));

// const App = () => {
//   const location = useLocation();

//   return (
//     <Suspense fallback={<div className="text-white text-center p-10">Loading...</div>}>
//       <AnimatePresence mode="wait" initial={false}>
//         <Routes location={location} key={location.pathname}>
//           <Route path="/home" element={<Home />} />
//           <Route path="/upload" element={<Upload />} />
//           <Route path="/analyze" element={<Analyze />} />
//           <Route path="/analysis" element={<Analysis />} />
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </AnimatePresence>
//     </Suspense>
//   );
// };

// export default App;



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
const NotFound = lazy(() => import('./pages/NotFound'));

const App = () => {
  return (
    <Suspense fallback={<div className="text-white text-center p-10">Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
