

// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import './layout.css';

// const Upload = () => {
//   const [file, setFile] = useState(null);
//   const [responseMessage, setResponseMessage] = useState('');
//   const [fileDetails, setFileDetails] = useState(null);
//   const [fileRecords, setFileRecords] = useState([]);

//   const handleFileChange = async (event) => {
//     const uploadedFile = event.target.files[0];
//     setFile(uploadedFile);

//     if (uploadedFile) {
//       const formData = new FormData();
//       formData.append('file', uploadedFile);

//       try {
//         const response = await fetch('http://127.0.0.1:5000/upload', {
//           method: 'POST',
//           body: formData,
//         });

//         if (response.ok) {
//           const data = await response.json();
//           setResponseMessage(data.message || 'Upload successful');

//           // Optional fallback if backend doesn't return filename/size
//           setFileDetails({
//             filename: uploadedFile.name,
//             size: (uploadedFile.size / 1024).toFixed(2),
//           });

//           // If backend returns records
//           if (data.records) {
//             setFileRecords(data.records.slice(0, 10));
//           }

//         } else {
//           const errorData = await response.json();
//           setResponseMessage(errorData.error || 'Failed to upload file.');
//         }
//       } catch (error) {
//         console.error('Upload error:', error);
//         setResponseMessage('An error occurred while uploading the file.');
//       }


//     }
//   };

//   return (
//     <div className="upload-page">
//       {/* Header */}
//       <header className="font-energetic min-h-[60px] flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full bg-black text-sm py-3 border-b border-gray-600">
//         <nav className="relative max-w-screen-2xl w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
//           <div className="flex items-center justify-between w-full">
//             <Link to="/" className="text-xl font-semibold text-white">
//               Forcastica
//             </Link>
//             <div className="flex gap-6">
//               <Link to="/home" className="text-white hover:text-orange-500">Home</Link>
//               <Link to="/upload" className="text-white hover:text-orange-500">Upload</Link>
//               <Link to="/analyze" className="text-white hover:text-orange-500">Analyze</Link>
//               <Link to="/analysis" className="text-white hover:text-orange-500">Results</Link>
//             </div>
//           </div>
//         </nav>
//       </header>

//       {/* Upload Section */}
//       <section className="p-10">
//         <h1 className="text-2xl font-bold mb-4">Upload a CSV File</h1>
//         <input
//           type="file"
//           accept=".csv"
//           onChange={handleFileChange}
//           className="mb-4 border border-gray-300 p-2"
//         />

//         {file && (
//           <p className="mb-2 text-gray-700">Selected File: <strong>{file.name}</strong></p>
//         )}

//         {responseMessage && (
//           <p className={`mb-4 ${responseMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
//             {responseMessage}
//           </p>
//         )}

//         {fileDetails && (
//           <div className="mb-4">
//             <p className="font-semibold">File Details:</p>
//             <ul className="list-disc pl-5">
//               <li>Filename: {fileDetails.filename}</li>
//               <li>Size: {fileDetails.size} KB</li>
//             </ul>
//           </div>
//         )}

//         {fileRecords.length > 0 && (
//           <div className="overflow-auto border border-gray-300">
//             <table className="min-w-full table-auto text-sm">
//               <thead className="bg-gray-200">
//                 <tr>
//                   {Object.keys(fileRecords[0]).map((key) => (
//                     <th key={key} className="border px-4 py-2 text-left">{key}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {fileRecords.map((row, rowIndex) => (
//                   <tr key={rowIndex} className="even:bg-gray-50">
//                     {Object.values(row).map((value, colIndex) => (
//                       <td key={colIndex} className="border px-4 py-1">{value}</td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </section>

//       {/* Footer */}
//       <footer className="text-center text-xs text-gray-500 py-4 border-t border-gray-200">
//         &copy; {new Date().getFullYear()} Forcastica. All rights reserved.
//       </footer>
//     </div>
//   );
// };

// export default Upload;




import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './layout.css';

import { useNavigate } from 'react-router-dom';




const Upload = () => {
  const [file, setFile] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [fileDetails, setFileDetails] = useState(null);
  const [fileRecords, setFileRecords] = useState([]);
  const navigate = useNavigate();
  
  const handleFileChange = async (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);

    if (uploadedFile) {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      try {
        const response = await fetch('/upload', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setResponseMessage(data.message || 'Upload successful');

          setFileDetails({
            filename: uploadedFile.name,
            size: (uploadedFile.size / 1024).toFixed(2),
          });

          if (data.records && Array.isArray(data.records)) {
            setFileRecords(data.records.slice(0, 100));
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
        setResponseMessage('An error occurred while uploading the file.');
        setFileRecords([]);
      }
    }
  };

  return (
    <div className="upload-page">
      {/* Header */}
      <header className="font-energetic min-h-[60px] flex flex-wrap justify-between items-center px-6 bg-black text-white text-sm py-3 border-b border-gray-600">
        <Link to="/" className="text-xl font-semibold">Forcastica</Link>
        <nav className="space-x-4">
          <Link to="/home" className="text-white hover:text-orange-500">Home</Link>
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

        {fileRecords.length > 0 ? (
          <div className="overflow-auto max-h-[500px] border border-gray-300 rounded-lg mt-6">
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
                    {Object.values(row).map((value, colIndex) => (
                      <td key={colIndex} className="border px-4 py-1 whitespace-nowrap">
                        {typeof value === 'string' && value.length > 60
                          ? value.slice(0, 60) + '...'
                          : value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-4">No records to display.</p>
        )}
      </section>
      <button
  onClick={async () => {
    const response = await fetch('/analyze');
    if (response.ok) {
      // window.location.href = '/analyze'; 
      navigate('/analyze');

      // Navigate to analysis page
    } else {
      alert('Failed to generate statistics');
    }
  }}
  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
>
  Generate Statistics
</button>


      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 py-4 border-t border-gray-200">
        &copy; {new Date().getFullYear()} Forcastica. All rights reserved.
      </footer>
    </div>
  );
};

export default Upload;
