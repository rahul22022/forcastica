
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './layout.css';

const Analysis = () => {
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [data, setData] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch current data state
    const fetchData = async () => {
      try {
        const response = await fetch('/current-data');
        if (response.ok) {
          const result = await response.json();
          setData(result.data);
        }
      } catch (error) {
        setMessage('Error fetching data: ' + error.message);
      }
    };
    fetchData();
  }, []);

  const handleColumnSelect = (column) => {
    setSelectedColumns(prev => 
      prev.includes(column) 
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const handleRemoveColumns = async () => {
    try {
      const response = await fetch('/remove-columns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ columns: selectedColumns }),
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
        setMessage('Columns removed successfully');
        setSelectedColumns([]);
      }
    } catch (error) {
      setMessage('Error removing columns: ' + error.message);
    }
  };

  const handleNullValues = async (action) => {
    try {
      const response = await fetch('/handle-nulls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          columns: selectedColumns,
          action: action 
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
        setMessage(`Null values handled with ${action}`);
      }
    } catch (error) {
      setMessage('Error handling null values: ' + error.message);
    }
  };

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

      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Data Analysis & Manipulation</h2>
          
          {message && (
            <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
              {message}
            </div>
          )}

          {data && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Select Columns</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.keys(data).map(column => (
                    <label key={column} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(column)}
                        onChange={() => handleColumnSelect(column)}
                        className="form-checkbox"
                      />
                      <span>{column}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Actions</h3>
                <div className="space-y-4">
                  <button
                    onClick={handleRemoveColumns}
                    disabled={selectedColumns.length === 0}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Remove Selected Columns
                  </button>
                  
                  <div className="space-x-4">
                    <button
                      onClick={() => handleNullValues('remove')}
                      disabled={selectedColumns.length === 0}
                      className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
                    >
                      Remove Null Rows
                    </button>
                    <button
                      onClick={() => handleNullValues('mean')}
                      disabled={selectedColumns.length === 0}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Fill with Mean
                    </button>
                    <button
                      onClick={() => handleNullValues('mode')}
                      disabled={selectedColumns.length === 0}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      Fill with Mode
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Preview */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Data Preview</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(data).map(column => (
                          <th
                            key={column}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Show first 5 rows */}
                      {Array.from({ length: 5 }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                          {Object.values(data).map((column, colIndex) => (
                            <td
                              key={colIndex}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            >
                              {column[rowIndex]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    <footer className="bg-black text-gray-400 py-8 border-t border-gray-600">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-bold mb-4">Forcastica</h3>
              <p className="mb-2">RudraTech LLC</p>
              <p className="mb-2">Registered in Virginia</p>
              <p>www.forcastica.com</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Contact</h3>
              <p className="mb-2">info@forcastica.com</p>
              <p className="mb-2">Virginia, USA</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Legal</h3>
              <p className="mb-2">© {new Date().getFullYear()} RudraTech LLC</p>
              <p>All rights reserved</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Analysis;
