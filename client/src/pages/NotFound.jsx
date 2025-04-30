import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen text-center text-white">
    <h1 className="text-5xl font-bold mb-4">404</h1>
    <p className="text-xl mb-8">Page Not Found</p>
    <Link to="/" className="text-orange-400 underline">
      Go Home
    </Link>
  </div>
);

export default NotFound;
