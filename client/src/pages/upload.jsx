import React, { useState } from 'react';
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
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        setResponseMessage(data.message || 'Upload successful');

        setFileDetails({
          filename: uploadedFile.name,
          size: (uploadedFile.size / 1024).toFixed(2),
        });

        } catch (parseError) {
          console.error('JSON Parse error:', parseError, 'Response:', text);
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
        <Link to="/" className="text-xl font-semibold">Forcastica</Link>
        <nav className="space-x-4">
          <Link to="/" className="text-white hover:text-orange-500">Home</Link>
          <Link to="/upload" className="hover:text-orange-400">Upload</Link>
          <Link to="/analyze" className="hover:text-orange-400">Analyze</Link>
          <Link to="/analysis" className="hover:text-orange-400">Results</Link>
        </nav>
      </header>

      {/* Upload Section */}
      <section className="p-10">
        <h1 className="text-2xl font-bold mb-4">Upload a CSV File</h1>
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

            <h3 className="text-xl font-semibold mb-4">Data Preview (First 10 Records)</h3>
            <div className="overflow-auto max-h-[500px] border border-gray-300 rounded-lg">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-gray-200 sticky top-0 z-10">
                  <tr>
                    {Object.keys(fileRecords[0]).map((key) => (
                      <th key={key} className="border px-4 py-2 text-left">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fileRecords.map((row, rowIndex) => (
                    <tr key={rowIndex} className="even:bg-gray-50">
                      {Object.entries(row).map(([key, value], colIndex) => (
                        <td key={colIndex} className="border px-4 py-1 whitespace-nowrap">
                          {value === null || value === undefined ? 'N/A' : 
                           String(value).length > 60 ? String(value).slice(0, 60) + '...' : value}
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
      <footer className="text-center text-xs text-gray-500 py-4 border-t border-gray-200">
        &copy; {new Date().getFullYear()} Forcastica. All rights reserved.
      </footer>
    </div>
  );
};

export default Upload;