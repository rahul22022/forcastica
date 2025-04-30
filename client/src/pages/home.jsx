import React from 'react';
import { Link } from 'react-router-dom';
import './layout.css'; 
// import { motion } from 'framer-motion';
// import { Helmet } from 'react-helmet';


const Home = () => {
  return (
    <>
    

      {/* Header/Navbar */}
      <header className="font-energetic min-h-[60px] flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full bg-black text-sm py-3 sm:py-0 border-b-[1px] border-solid border-gray-600" id="header">
        <nav aria-label="Global" className="relative max-w-screen-2xl w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-grow-1">
            <Link to="/" className="flex text-xl gap-2 items-center justify-center font-semibold text-white">
            
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

      {/* Hero Section */}
      <section id="hero-RQKqVK" className="text-orange-100 font-energetic" style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.pexels.com/photos/27141316/pexels-photo-27141316.jpeg')",
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        height: '100%',
      }}>
        <div className="container max-w-screen-2xl mx-auto flex px-5 py-24 pt-64 md:flex-row flex-col items-center">
          <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center">
            <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-orange-100">Predicting future by analyzing past</h1>
            <p className="mb-8 leading-relaxed">
              Forcastica helps you generate insights, analyze your data, and forecast what’s next using machine learning.
            </p>
            <div className="flex justify-center">
              <Link to="/upload" className="get-started-btn font-medium text-white bg-orange-500 hover:bg-orange-600 py-2 px-4 rounded-lg">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

    </>
  );
};

export default Home;
