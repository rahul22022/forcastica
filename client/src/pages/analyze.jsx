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
        const res = await fetch('/images');

        if (!res.ok) {
          throw new Error('Failed to fetch image list from server');
        }

        const data = await res.json();
        if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
          throw new Error('No images found. Run analysis first.');
        }

        const imageUrls = data.images.map(filename => `/images/${filename}`);
        console.log('Found images:', imageUrls);
        setImages(imageUrls);
      } catch (err) {
        console.error('Error:', err.message);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-black text-white px-6 py-4 flex justify-between items-center border-b border-gray-700">
        <Link to="/" className="flex items-center gap-2">
          <img src="/forcastica_logo.png" alt="Forcastica Logo" className="h-6 w-auto" />
        </Link>
        <nav className="space-x-4">
          <Link to="/" className="hover:text-orange-400">Home</Link>
          <Link to="/upload" className="hover:text-orange-400">Upload</Link>
          <Link to="/analyze" className="hover:text-orange-400">Analyze</Link>
          <Link to="/analysis" className="hover:text-orange-400">Data Analysis</Link>
        </nav>
      </header>

      <main className="flex-grow px-4 py-10 max-w-screen-xl mx-auto w-full">
        <h2 className="text-3xl font-semibold text-center mb-6">Generated Analysis Charts</h2>

        {loading && (
          <p className="text-blue-600 text-center">Loading images...</p>
        )}

        {error && (
          <p className="text-red-600 text-center">{error}</p>
        )}

        {!loading && !error && images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((src, index) => (
              <div key={index} className="bg-white rounded shadow p-4">
                <img
                  src={src}
                  alt={`Chart ${index + 1}`}
                  className="w-full h-auto rounded object-contain"
                  onError={(e) => console.error(`Failed to load: ${src}`)}
                />
                <p className="text-sm text-center mt-2 text-gray-600">
                  {src.split('/').pop().replace('.png', '')}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-black text-gray-400 text-center text-sm py-6 border-t border-gray-600">
        &copy; {new Date().getFullYear()} Forcastica — Predicting your future from your data.
      </footer>
    </div>
  );
};

export default Analyze;