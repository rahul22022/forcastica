import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [fileRecords, setFileRecords] = useState([]);
  const [responseMessage, setResponseMessage] = useState('');
  const [availableFiles, setAvailableFiles] = useState([]);
  const [info, setInfo] = useState('');
  const [nullCounts, setNullCounts] = useState({});
  const navigate = useNavigate();

  React.useEffect(() => {
    fetch('/list-files')
      .then(response => response.json())
      .then(data => setAvailableFiles(data.files))
      .catch(error => console.error('Error fetching files:', error));
  }, []);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResponseMessage('Uploading file...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setFileDetails(data);
        setFileRecords(data.analysis.preview || []);
        setInfo(data.analysis.info || '');
        setNullCounts(data.analysis.null_counts || {});
        setResponseMessage('File uploaded successfully!');
      } else {
        setResponseMessage(data.error || 'Upload failed');
      }
    } catch (error) {
      setResponseMessage('Error uploading file');
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="font-energetic min-h-[60px] flex justify-between items-center px-6 bg-black text-white text-sm py-3 border-b border-gray-600">
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 p-1 rounded-lg mb-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Upload Dataset</h1>

            <div className="space-y-4">
              {/* File Upload Section */}
              <div className="bg-gray-800 rounded-lg p-3 max-w-md mx-auto">
                <h2 className="text-lg font-semibold text-orange-400 mb-2">New File Upload</h2>
                <div className="border-2 border-dashed border-orange-400 rounded-lg p-3 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="fileInput"
                  />
                  <label htmlFor="fileInput" className="cursor-pointer block">
                    <svg className="mx-auto h-6 w-6 text-orange-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-white text-xs">Drop CSV file here or click to select</span>
                    <span className="block text-xs text-orange-300 mt-1">Maximum file size: 10MB</span>
                  </label>
                </div>
              </div>

              {/* Existing Files Section */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-orange-400 mb-4">Select Existing File</h2>
                <select 
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
                  onChange={async (e) => {
                    if (e.target.value) {
                      try {
                        const formData = new FormData();
                        const blob = new Blob([''], { type: 'text/csv' });
                        const file = new File([blob], e.target.value);
                        formData.append('file', file);
                        
                        const response = await fetch('/upload', {
                          method: 'POST',
                          body: formData
                        });
                        
                        const data = await response.json();
                        if (response.ok) {
                          setFileDetails(data);
                          setFileRecords(data.analysis.preview || []);
                          setInfo(data.analysis.info || '');
                          setNullCounts(data.analysis.null_counts || {});
                          setResponseMessage('File loaded successfully!');
                        } else {
                          setResponseMessage(data.error || 'Failed to load file');
                        }
                      } catch (error) {
                        setResponseMessage('Error loading file');
                        console.error('Load error:', error);
                      }
                    }
                  }}
                >
                  <option value="">Choose a file</option>
                  {availableFiles.map((filename, index) => (
                    <option key={index} value={filename}>{filename}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Message */}
            {responseMessage && (
              <div className={`mt-6 p-4 rounded-lg ${responseMessage.includes('success') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                {responseMessage}
              </div>
            )}
          </div>
        </div>

        {/* File Analysis Section */}
        {fileDetails && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">File Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-2">Dataset Info</h3>
                  <pre className="text-sm text-gray-300 overflow-auto max-h-60">{info}</pre>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-2">Null Values</h3>
                  {Object.entries(nullCounts).map(([col, count]) => (
                    <div key={col} className="flex justify-between text-sm py-1">
                      <span className="text-orange-300 font-medium">{col}:</span>
                      <span className={count > 0 ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Data Preview */}
            {fileRecords.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 overflow-hidden">
                <h2 className="text-xl font-semibold text-white mb-4">Data Preview</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900">
                      <tr>
                        {Object.keys(fileRecords[0]).map((key) => (
                          <th key={key} className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {fileRecords.slice(0, 5).map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-700">
                          {Object.values(row).map((value, colIndex) => (
                            <td key={colIndex} className="px-4 py-2 text-sm text-gray-300 whitespace-nowrap">
                              {value === null ? 'N/A' : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Generate Statistics Button */}
            <button
              onClick={async () => {
                try {
                  setResponseMessage('Generating statistics...');
                  const response = await fetch('/analyze');
                  if (response.ok) {
                    const data = await response.json();
                    if (data.images && data.images.length > 0) {
                      navigate('/analyze');
                    } else {
                      setResponseMessage('No statistics were generated. Please upload a file first.');
                    }
                  } else {
                    setResponseMessage('Failed to generate statistics');
                  }
                } catch (error) {
                  setResponseMessage('Error generating statistics');
                }
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Generate Statistics
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Upload;