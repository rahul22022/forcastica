import React from 'react';
import { Link } from 'react-router-dom';
import './layout.css';

const Analysis = () => {
  return (
    <div>

      {/* Header/Navbar */}
      <header className="font-energetic min-h-[60px] flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full bg-black text-sm py-3 sm:py-0 border-b-[1px] border-solid border-gray-600" id="header">
        <nav aria-label="Global" className="relative max-w-screen-2xl w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-grow-1">
            <Link to="/" className="flex text-xl gap-2 items-center justify-center font-semibold text-white">
              <span className="text-[16px] md:text-[20px] leading-none">Forcastica</span>
            </Link>
          </div>
          <div className="hs-collapse hidden overflow-hidden transition-all duration-300 sm:block" id="navbar-collapse-with-animation">
            <div className="flex flex-col gap-y-4 gap-x-0 mt-5 sm:flex-row sm:items-center sm:justify-end sm:gap-y-0 sm:gap-x-7 sm:mt-0 sm:ps-7">
              <Link to="/" className="font-medium text-white hover:text-orange-500 sm:py-6">Home</Link>
              <Link to="/upload" className="font-medium text-white hover:text-orange-500 sm:py-6">Upload</Link>
              <Link to="/analyze" className="font-medium text-white hover:text-orange-500 sm:py-6">Analyze Data</Link>
              <Link to="/analysis" className="font-medium text-white hover:text-orange-500 sm:py-6">Data Analysis</Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Carousel Section */}
      <div className="bg-black font-energetic px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto" id="carousel-section">
        <div className="max-w-screen-2xl flex flex-col items-center justify-center mx-auto gap-4">
          <p className="text-2xl font-bold text-white">Data Analysis Views</p>
          <div className="w-full lg:w-3/4 aspect-video relative">
            <div className="relative w-full h-full rounded-lg overflow-hidden text-gray-400">

              {/* Left Button */}
              <button className="absolute left-0 top-0 z-30 h-full bg-black opacity-60 flex items-center px-2">
                {/* Left arrow */}
                <svg fill="none" height="40" width="40" stroke="white" viewBox="0 0 24 24">
                  <path d="M14 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                </svg>
              </button>

              {/* Slides */}
              <div id="slider" className="flex transition-transform duration-500" style={{ whiteSpace: 'nowrap' }}>
                <div className="w-full h-full inline-block relative">
                  <img src="https://images.pexels.com/photos/2127039/pexels-photo-2127039.jpeg" alt="Bivariate" className="w-full h-full object-cover"/>
                  <div className="absolute bottom-0 w-full bg-black text-white text-center py-2">Bivariate Analysis</div>
                </div>
                <div className="w-full h-full inline-block relative">
                  <img src="/blocks/examples/video.jpg" alt="Multivariate" className="w-full h-full object-cover"/>
                  <div className="absolute bottom-0 w-full bg-black text-white text-center py-2">Multivariate Analysis</div>
                </div>
                <div className="w-full h-full inline-block relative">
                  <img src="/blocks/examples/contacts.jpg" alt="Fields" className="w-full h-full object-cover"/>
                  <div className="absolute bottom-0 w-full bg-black text-white text-center py-2">Fields</div>
                </div>
              </div>

              {/* Right Button */}
              <button className="absolute right-0 top-0 z-30 h-full bg-black opacity-60 flex items-center px-2">
                {/* Right arrow */}
                <svg fill="none" height="40" width="40" stroke="white" viewBox="0 0 24 24">
                  <path d="M10 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                </svg>
              </button>

            </div>
            <p className="mt-3 text-gray-400">Swipe through different types of analyses.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black font-energetic p-4 sm:pt-10 lg:p-12 border-t-[1px] border-solid border-gray-600" id="footer">
        <footer className="mx-auto max-w-screen-2xl px-4 md:px-8">
          <div className="mb-16 flex flex-col md:flex-row md:gap-12 gap-4 pt-10 lg:gap-8 lg:pt-12">
            <div className="col-span-full lg:col-span-2">
              <div className="mb-4 lg:-mt-2">
                <Link to="/" className="text-white inline-flex items-center gap-2 text-xl font-bold md:text-2xl">
                  Forcastica
                </Link>
              </div>
              <p className="text-gray-400 max-w-[500px] mb-6 sm:pr-8">
                Predicting future by knowing your past
              </p>
            </div>
            <div>
              <div className="text-gray-400 mb-4 font-bold tracking-widest">Navigation</div>
              <nav className="flex flex-col gap-4">
                <Link to="/" className="text-gray-400 hover:text-orange-500 transition duration-100">Home</Link>
                <Link to="/upload" className="text-gray-400 hover:text-orange-500 transition duration-100">Upload</Link>
                <Link to="/analyze" className="text-gray-400 hover:text-orange-500 transition duration-100">Analyze Data</Link>
                <Link to="/analysis" className="text-gray-400 hover:text-orange-500 transition duration-100">Data Analysis</Link>
              </nav>
            </div>
          </div>
        </footer>
      </div>

    </div>
  );
};

export default Analysis;