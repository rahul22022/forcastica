import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './layout.css';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [fileDetails, setFileDetails] = useState(null);
  const [fileRecords, setFileRecords] = useState([]);
  const [info, setInfo] = useState('');
  const [nullCounts, setNullCounts] = useState(null);
  const [availableFiles, setAvailableFiles] = useState([]);

  const fetchAvailableFiles = async () => {
    try {
      const response = await fetch('/list-files');
      if (response.ok) {
        const data = await response.json();
        setAvailableFiles(data.files);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  useEffect(() => {
    fetchAvailableFiles();
  }, [responseMessage]); // Refresh when new file is uploaded
  const navigate = useNavigate();

  const handleFileChange = async (event) => {
    try {
      const uploadedFile = event.target.files[0];
      if (!uploadedFile) {
        setResponseMessage('Please select a file');
        return;
      }

      if (!uploadedFile.name.endsWith('.csv')) {
        setResponseMessage('Please select a CSV file');
        return;
      }

      setFile(uploadedFile);
      setResponseMessage('Uploading file...');

      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      const contentType = response.headers.get("content-type");
      let data;
      
      if (response.ok) {
        try {
          if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
          } else {
            const text = await response.text();
            data = JSON.parse(text);
          }
          setResponseMessage(data.message || 'Upload successful');
          setFileDetails({
            filename: uploadedFile.name,
            size: (uploadedFile.size / 1024).toFixed(2),
          });

        } catch (parseError) {
          const errorText = await response.text();
          console.error('JSON Parse error:', parseError, 'Response:', errorText);
          throw new Error('Failed to parse server response');
        }
        
        if (data.analysis) {
          setFileRecords(data.analysis.preview || []);
          setInfo(data.analysis.info || '');
          setNullCounts(data.analysis.null_counts || {});
        } else {
          setFileRecords([]);
        }
      } else {
        const errorData = await response.json();
        setResponseMessage(errorData.error || 'Failed to upload file.');
        setFileRecords([]);
      }
    } catch (error) {
        console.error('Upload error:', error);
        const errorMessage = error.response?.data?.error || 
          (error.message ? `Upload failed: ${error.message}` : 'An error occurred while uploading the file.');
        setResponseMessage(errorMessage);
        setFileRecords([]);
        setFileDetails(null);
        setInfo('');
        setNullCounts(null);
      }
  };

  return (
    <div className="upload-page">
      {/* Header */}
      <header className="font-energetic min-h-[60px] flex flex-wrap justify-between items-center px-6 bg-black text-white text-sm py-3 border-b border-gray-600">
        <Link to="/" className="flex items-center gap-2">
              <img src="/forcastica_logo.png" alt="Forcastica Logo" className="h-6 w-auto" />
            </Link>
        <nav className="space-x-4">
          <Link to="/" className="text-white hover:text-orange-500">Home</Link>
          <Link to="/upload" className="hover:text-orange-400">Upload</Link>
          <Link to="/analyze" className="hover:text-orange-400">Analyze</Link>
          <Link to="/analysis" className="hover:text-orange-400">Data Analysis</Link>
        </nav>
      </header>

      {/* Upload Section */}
      <section className="p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Upload a CSV File</h1>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Data Selection</h3>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                {availableFiles.length} {availableFiles.length === 1 ? 'file' : 'files'}
              </span>
            </div>
            
            <div className="mb-8">
              <h4 className="text-lg font-medium mb-3">Upload New File</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileInput"
                />
                <label htmlFor="fileInput" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-gray-600">Drop CSV file here or click to select</span>
                    <span className="text-sm text-gray-500 mt-1">Maximum file size: 10MB</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-lg font-medium mb-3">Available Files</h4>
              {availableFiles.length > 0 ? (
                <div>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => {
                      const file = new File([''], e.target.value, { type: 'text/csv' });
                      handleFileChange({ target: { files: [file] } });
                    }}
                  >
                    <option value="">Select a file</option>
                    {availableFiles.map((file, index) => (
                      <option key={index} value={file}>{file}</option>
                    ))}
                  </select>
                </div>
              ) : (
              <div className="text-center py-6">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-gray-500">No files available</p>
                <p className="text-sm text-gray-400">Upload a CSV file to get started</p>
              </div>
            )}
          </div>
        </div>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="mb-4 border border-gray-300 p-2"
        />

        {file && (
          <p className="mb-2 text-gray-700">Selected File: <strong>{file.name}</strong></p>
        )}

        {responseMessage && (
          <p className={`mb-4 ${responseMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {responseMessage}
          </p>
        )}

        {fileDetails && (
          <div className="mb-4">
            <p className="font-semibold">File Details:</p>
            <ul className="list-disc pl-5">
              <li>Filename: {fileDetails.filename}</li>
              <li>Size: {fileDetails.size} KB</li>
            </ul>
          </div>
        )}

        {fileRecords && fileRecords.length > 0 ? (
          <>
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Data Analysis</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h4 className="text-lg font-medium mb-3">Dataset Info</h4>
                  <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto">
                    {info}
                  </pre>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h4 className="text-lg font-medium mb-3">Null Value Counts</h4>
                  <div className="space-y-2">
                    {Object.entries(nullCounts || {}).map(([col, count]) => (
                      <div key={col} className="flex justify-between">
                        <span>{col}:</span>
                        <span className={count > 0 ? 'text-red-500' : 'text-green-500'}>
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Column Analysis</h3>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="text-lg font-medium mb-3">Column Recommendations</h4>
                <div className="space-y-4">
                  {fileDetails?.analysis?.unique_analysis && 
                    Object.entries(fileDetails.analysis.unique_analysis).map(([column, analysis]) => (
                      <div key={column} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{column}</span>
                          {analysis.is_unique_identifier && (
                            <span className="text-red-500 text-sm">Suggested for removal (Unique Identifier)</span>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <div>Unique Values: {analysis.unique_count} / {analysis.total_count} ({(analysis.unique_ratio * 100).toFixed(1)}%)</div>
                          <div>Null Values: {analysis.null_count}</div>
                          {analysis.null_count > 0 && (
                            <div className="mt-2 text-orange-600">
                              Suggested actions for null values:
                              <ul className="list-disc ml-4 mt-1">
                                <li>Remove rows with null values</li>
                                <li>Fill with mean/median (for numeric)</li>
                                <li>Fill with mode (for categorical)</li>
                                <li>Fill with a custom value</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-4">Data Preview (First 10 Records)</h3>
            <div className="overflow-auto max-h-[500px] border border-gray-300 rounded-lg shadow-lg">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-gray-800 text-white sticky top-0 z-10">
                  <tr>
                    {Object.keys(fileRecords[0]).map((key) => (
                      <th key={key} className="border border-gray-600 px-4 py-3 text-left font-semibold">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {fileRecords.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50 transition-colors duration-150">
                      {Object.entries(row).map(([key, value], colIndex) => (
                        <td key={colIndex} className="border px-4 py-2 font-mono text-right">
                          {value === null || value === undefined ? 
                            <span className="text-gray-400">N/A</span> : 
                            value.toString().match(/^-?\d+\.?\d*$/) ?
                              <span className="text-blue-600">{value}</span> :
                              <span className="text-gray-700 text-left">{
                                String(value).length > 60 ? 
                                String(value).slice(0, 60) + '...' : 
                                value
                              }</span>
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 mt-4">No records to display.</p>
        )}
      </section>
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
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center space-x-2"
      >
        <span>Generate Statistics</span>
        {responseMessage === 'Generating statistics...' && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        )}
      </button>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-8 border-t border-gray-600 mt-auto">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Forcastica</span>
              <span className="text-sm">| RudraTech LLC, Virginia | www.forcastica.com</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Contact</span>
              <span className="text-sm">| info@forcastica.com | Virginia, USA</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Legal</span>
              <span className="text-sm">| © {new Date().getFullYear()} RudraTech LLC | All rights reserved</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Upload;