// // import React from 'react';
// // import { Link } from 'react-router-dom';
// // import './layout.css'; 

// // const Analyze = () => {
// //   return (
// //     <div>

// //       {/* Header/Navbar */}
// //       <header className="font-energetic min-h-[60px] flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full bg-black text-sm py-3 sm:py-0 border-b-[1px] border-solid border-gray-600" id="header">
// //         <nav aria-label="Global" className="relative max-w-screen-2xl w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
// //           <div className="flex items-center justify-between flex-grow-1">
// //             <Link to="/" className="flex text-xl gap-2 items-center justify-center font-semibold text-white">
// //               <span className="text-[16px] md:text-[20px] leading-none">Forcastica</span>
// //             </Link>
// //           </div>
// //           <div className="hs-collapse hidden overflow-hidden transition-all duration-300 sm:block" id="navbar-collapse-with-animation">
// //             <div className="flex flex-col gap-y-4 gap-x-0 mt-5 sm:flex-row sm:items-center sm:justify-end sm:gap-y-0 sm:gap-x-7 sm:mt-0 sm:ps-7">
// //               <Link to="/" className="font-medium text-white hover:text-orange-500 sm:py-6">Home</Link>
// //               <Link to="/upload" className="font-medium text-white hover:text-orange-500 sm:py-6">Upload</Link>
// //               <Link to="/analyze" className="font-medium text-white hover:text-orange-500 sm:py-6">Analyze Data</Link>
// //               <Link to="/analysis" className="font-medium text-white hover:text-orange-500 sm:py-6">Data Analysis</Link>
// //             </div>
// //           </div>
// //         </nav>
// //       </header>

// //       {/* Page Content */}
// //       <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black p-6">
// //         <h1 className="text-3xl font-bold mb-6">Analyze Your Data</h1>
// //         <p className="text-lg text-center max-w-2xl">
// //           Start uploading your datasets and get powerful analysis and insights using machine learning.
// //         </p>
// //       </main>

// //       {/* Footer */}
// //       <div className="bg-black font-energetic p-4 sm:pt-10 lg:p-12 border-t-[1px] border-solid border-gray-600" id="footer">
// //         <footer className="mx-auto max-w-screen-2xl px-4 md:px-8">
// //           <div className="mb-16 flex flex-col md:flex-row md:gap-12 gap-4 pt-10 lg:gap-8 lg:pt-12">
// //             <div className="col-span-full lg:col-span-2">
// //               <div className="mb-4 lg:-mt-2">
// //                 <Link to="/" className="text-white inline-flex items-center gap-2 text-xl font-bold md:text-2xl">
// //                   Forcastica
// //                 </Link>
// //               </div>
// //               <p className="text-gray-400 max-w-[500px] mb-6 sm:pr-8">
// //                 Predicting future by knowing your past
// //               </p>
// //             </div>
// //             <div>
// //               <div className="text-gray-400 mb-4 font-bold tracking-widest">Navigation</div>
// //               <nav className="flex flex-col gap-4">
// //                 <Link to="/" className="text-gray-400 hover:text-orange-500 transition duration-100">Home</Link>
// //                 <Link to="/upload" className="text-gray-400 hover:text-orange-500 transition duration-100">Upload</Link>
// //                 <Link to="/analyze" className="text-gray-400 hover:text-orange-500 transition duration-100">Analyze Data</Link>
// //                 <Link to="/analysis" className="text-gray-400 hover:text-orange-500 transition duration-100">Data Analysis</Link>
// //               </nav>
// //             </div>
// //           </div>
// //         </footer>
// //       </div>

// //     </div>
// //   );
// // };

// // export default Analyze;


// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import './layout.css';

// const Analyze = () => {
//   const [images, setImages] = useState([]);

//   useEffect(() => {
//     const fetchImages = async () => {
//       try {
//         // Get image names from a predefined list or dynamically
//         const possibleCols = [
//           'Age', 'Salary', 'Score', 'column1', 'column2',
//           'height', 'weight', 'income', 'experience'
//         ];

//         const availableImages = await Promise.all(
//           possibleCols.map(async (col) => {
//             const res = await fetch(`http://localhost:5000/images/${col}.png`);
//             return res.ok ? `http://localhost:5000/images/${col}.png` : null;
//           })
//         );

//         setImages(availableImages.filter(Boolean));
//       } catch (error) {
//         console.error("Failed to fetch images:", error);
//       }
//     };

//     fetchImages();
//   }, []);

//   return (
//     <div>

//       {/* Header/Navbar */}
//       <header className="font-energetic min-h-[60px] flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full bg-black text-sm py-3 sm:py-0 border-b-[1px] border-solid border-gray-600" id="header">
//         <nav aria-label="Global" className="relative max-w-screen-2xl w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between flex-grow-1">
//             <Link to="/" className="flex text-xl gap-2 items-center justify-center font-semibold text-white">
//               <span className="text-[16px] md:text-[20px] leading-none">Forcastica</span>
//             </Link>
//           </div>
//           <div className="hs-collapse hidden overflow-hidden transition-all duration-300 sm:block" id="navbar-collapse-with-animation">
//             <div className="flex flex-col gap-y-4 gap-x-0 mt-5 sm:flex-row sm:items-center sm:justify-end sm:gap-y-0 sm:gap-x-7 sm:mt-0 sm:ps-7">
//               <Link to="/" className="font-medium text-white hover:text-orange-500 sm:py-6">Home</Link>
//               <Link to="/upload" className="font-medium text-white hover:text-orange-500 sm:py-6">Upload</Link>
//               <Link to="/analyze" className="font-medium text-white hover:text-orange-500 sm:py-6">Analyze Data</Link>
//               <Link to="/analysis" className="font-medium text-white hover:text-orange-500 sm:py-6">Data Analysis</Link>
//             </div>
//           </div>
//         </nav>
//       </header>

//       {/* Page Content */}
//       <main className="flex flex-col items-center bg-gray-100 text-black p-6 min-h-screen">
//         <h1 className="text-3xl font-bold mb-6">Analyze Your Data</h1>
//         <p className="text-lg text-center max-w-2xl mb-10">
//           Below are the statistical analysis plots generated from your uploaded data.
//         </p>

//         {images.length === 0 ? (
//           <p className="text-gray-600">No analysis images available.</p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-screen-xl">
//             {images.map((src, index) => (
//               <div key={index} className="border rounded bg-white p-4 shadow">
//                 <img src={src} alt={`Histogram ${index}`} className="w-full object-contain" />
//               </div>
//             ))}
//           </div>
//         )}
//       </main>

//       {/* Footer */}
//       <div className="bg-black font-energetic p-4 sm:pt-10 lg:p-12 border-t-[1px] border-solid border-gray-600" id="footer">
//         <footer className="mx-auto max-w-screen-2xl px-4 md:px-8">
//           <div className="mb-16 flex flex-col md:flex-row md:gap-12 gap-4 pt-10 lg:gap-8 lg:pt-12">
//             <div className="col-span-full lg:col-span-2">
//               <div className="mb-4 lg:-mt-2">
//                 <Link to="/" className="text-white inline-flex items-center gap-2 text-xl font-bold md:text-2xl">
//                   Forcastica
//                 </Link>
//               </div>
//               <p className="text-gray-400 max-w-[500px] mb-6 sm:pr-8">
//                 Predicting future by knowing your past
//               </p>
//             </div>
//             <div>
//               <div className="text-gray-400 mb-4 font-bold tracking-widest">Navigation</div>
//               <nav className="flex flex-col gap-4">
//                 <Link to="/" className="text-gray-400 hover:text-orange-500 transition duration-100">Home</Link>
//                 <Link to="/upload" className="text-gray-400 hover:text-orange-500 transition duration-100">Upload</Link>
//                 <Link to="/analyze" className="text-gray-400 hover:text-orange-500 transition duration-100">Analyze Data</Link>
//                 <Link to="/analysis" className="text-gray-400 hover:text-orange-500 transition duration-100">Data Analysis</Link>
//               </nav>
//             </div>
//           </div>
//         </footer>
//       </div>

//     </div>
//   );
// };

// export default Analyze;

// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import './layout.css';

// const Analyze = () => {
//   const [loading, setLoading] = useState(true);
//   const [images, setImages] = useState([]);
//   const [error, setError] = useState('');
//   const [activeIndex, setActiveIndex] = useState(0);

//   // Trigger backend analysis + wait
//   useEffect(() => {
//     const generateAndLoadImages = async () => {
//       setLoading(true);
//       setError('');

//       try {
//         // Step 1: Trigger backend analysis
//         const response = await fetch('http://localhost:5000/analyze');
//         if (!response.ok) throw new Error('Analysis failed. Upload data first.');

//         // Step 2: Poll for known image names
//         const columnNames = [
//           'Age', 'Salary', 'Score', 'Height', 'Weight', 'column1', 'column2', 'Income', 'Experience'
//         ];

//         const loadedImages = await Promise.all(
//           columnNames.map(async (col) => {
//             const res = await fetch(`http://localhost:5000/images/${col}.png`);
//             return res.ok ? `http://localhost:5000/images/${col}.png` : null;
//           })
//         );

//         const filtered = loadedImages.filter(Boolean);
//         if (filtered.length === 0) {
//           throw new Error('No charts available.');
//         }

//         setImages(filtered);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     generateAndLoadImages();
//   }, []);

//   // Carousel navigation
//   const prev = () => setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
//   const next = () => setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

//   return (
//     <div>
//       {/* Header */}
//       <header className="font-energetic min-h-[60px] flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full bg-black text-sm py-3 border-b border-gray-600">
//         <nav className="relative max-w-screen-2xl w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
//           <div className="flex items-center justify-between w-full">
//             <Link to="/" className="text-xl font-semibold text-white">Forcastica</Link>
//             <div className="flex gap-6">
//               <Link to="/home" className="text-white hover:text-orange-500">Home</Link>
//               <Link to="/upload" className="text-white hover:text-orange-500">Upload</Link>
//               <Link to="/analyze" className="text-white hover:text-orange-500">Analyze</Link>
//               <Link to="/analysis" className="text-white hover:text-orange-500">Results</Link>
//             </div>
//           </div>
//         </nav>
//       </header>

//       {/* Main Content */}
//       <main className="p-10 min-h-screen bg-gray-100 text-center">
//         <h1 className="text-3xl font-bold mb-6">Data Analysis Results</h1>

//         {loading && <p className="text-blue-600">🔄 Generating statistical plots...</p>}
//         {error && <p className="text-red-600">{error}</p>}

//         {images.length > 0 && !loading && (
//           <div className="relative w-full max-w-3xl mx-auto">
//             <img
//               src={images[activeIndex]}
//               alt={`Chart ${activeIndex + 1}`}
//               className="w-full border rounded-lg shadow-lg object-contain"
//             />
//             <div className="flex justify-between mt-4">
//               <button
//                 onClick={prev}
//                 className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
//               >
//                 ◀ Prev
//               </button>
//               <button
//                 onClick={next}
//                 className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
//               >
//                 Next ▶
//               </button>
//             </div>
//             <p className="text-sm mt-2 text-gray-600">
//               Image {activeIndex + 1} of {images.length}
//             </p>
//           </div>
//         )}
//       </main>

//       {/* Footer */}
//       <footer className="bg-black text-center text-sm text-gray-400 py-6 border-t">
//         &copy; {new Date().getFullYear()} Forcastica — Predicting your future from your data.
//       </footer>
//     </div>
//   );
// };

// export default Analyze;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './layout.css';

const Analyze = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/images');
        if (!res.ok) throw new Error('Failed to fetch image list');
        const data = await res.json();

        if (data.images && Array.isArray(data.images)) {
          const urls = data.images.map(filename => `http://localhost:5000/images/${filename}`);
          setImages(urls);
        } else {
          throw new Error('No images found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  return (
    <div>
      {/* Header */}
      <header className="bg-black text-white px-6 py-4 flex justify-between items-center border-b border-gray-700">
        <h1 className="text-xl font-bold">Forcastica</h1>
        <nav className="space-x-4">
          <Link to="/home" className="hover:text-orange-400">Home</Link>
          <Link to="/upload" className="hover:text-orange-400">Upload</Link>
          <Link to="/analyze" className="hover:text-orange-400">Analyze</Link>
          <Link to="/analysis" className="hover:text-orange-400">Results</Link>
        </nav>
      </header>

      {/* Main */}
      <main className="p-8 bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-semibold text-center mb-6">Analysis Charts</h2>

        {loading && <p className="text-blue-600 text-center">🔄 Loading analysis images...</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}

        {images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {images.map((src, index) => (
              <div key={index} className="bg-white p-4 rounded shadow">
                <img src={src} alt={`Chart ${index}`} className="w-full h-auto rounded" />
                <p className="text-center text-sm mt-2 text-gray-700">
                  {src.split('/').pop().replace('.png', '')}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black text-gray-400 text-center text-sm py-6 border-t">
        &copy; {new Date().getFullYear()} Forcastica — Predicting your future from your data.
      </footer>
    </div>
  );
};

export default Analyze;
