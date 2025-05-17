
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Predictions = () => {
  const [selectedType, setSelectedType] = useState('');
  const [targetVariable, setTargetVariable] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [columns, setColumns] = useState([]);
  const [trainingResults, setTrainingResults] = useState(null);

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await fetch('/current-data');
        if (response.ok) {
          const data = await response.json();
          setColumns(Object.keys(data.data));
        }
      } catch (error) {
        setMessage('Error fetching columns: ' + error.message);
      }
    };
    fetchColumns();
  }, []);

  const handleTrainAndPredict = async () => {
    setLoading(true);
    setMessage('Training models and generating predictions... This may take a few minutes.');
    try {
      // Train models
      const trainResponse = await fetch('/train-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_column: targetVariable,
          problem_type: selectedType,
          processed_file: sessionStorage.getItem('processedFile')
        }),
      });

      if (!trainResponse.ok) {
        throw new Error('Training failed');
      }

      const trainData = await trainResponse.json();
      setTrainingResults(trainData.results);

      // Run predictions
      const predictResponse = await fetch('/run-predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_name: selectedModel,
          problem_type: selectedType,
          target_column: targetVariable,
          processed_file: sessionStorage.getItem('processedFile')
        }),
      });

      if (predictResponse.ok) {
        const data = await predictResponse.json();
        setResults(data);
        setMessage('Model trained and predictions completed successfully!');
      } else {
        const error = await predictResponse.json();
        throw new Error(error.error || 'Prediction failed');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
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
          <Link to="/predictions" className="hover:text-orange-400">Model & Predictions</Link>
        </nav>
      </header>

      <main className="flex-grow p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Model Training & Predictions</h2>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Problem Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setSelectedModel('');
                  }}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Choose a problem type</option>
                  <option value="classification">Classification</option>
                  <option value="regression">Regression</option>
                  <option value="time_series">Time Series</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Variable
                </label>
                <select
                  value={targetVariable}
                  onChange={(e) => setTargetVariable(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select target column</option>
                  {columns.map(column => (
                    <option key={column} value={column}>{column}</option>
                  ))}
                </select>
              </div>

              {selectedType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Choose a model</option>
                    {selectedType === 'classification' ? (
                      <>
                        <option value="logistic_regression">Logistic Regression</option>
                        <option value="random_forest">Random Forest</option>
                        <option value="xgboost">XGBoost</option>
                        <option value="svm">Support Vector Machine</option>
                      </>
                    ) : selectedType === 'regression' ? (
                      <>
                        <option value="linear_regression">Linear Regression</option>
                        <option value="random_forest">Random Forest</option>
                        <option value="xgboost">XGBoost</option>
                      </>
                    ) : (
                      <>
                        <option value="arima">ARIMA</option>
                        <option value="prophet">Prophet</option>
                        <option value="lstm">LSTM</option>
                      </>
                    )}
                  </select>
                </div>
              )}
            </div>

            <button
              onClick={handleTrainAndPredict}
              disabled={!selectedModel || !targetVariable || loading}
              className="mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Train Model & Run Predictions'}
            </button>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-md">
              {message}
            </div>
          )}

          {trainingResults && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Training Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(trainingResults).map(([model, metrics]) => (
                  <div key={model} className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h5 className="text-lg font-medium text-primary mb-2">{model}</h5>
                    <div className="space-y-1">
                      {Object.entries(metrics).map(([metric, value]) => (
                        metric !== 'confusion_matrix' && (
                          <div key={metric} className="flex justify-between items-center">
                            <span className="text-gray-600">{metric}:</span>
                            <span className="font-medium">
                              {typeof value === 'number' ? value.toFixed(4) : value}
                            </span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results && !loading && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">Prediction Results</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(results.predictions[0] || {}).map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.predictions.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((value, cellIdx) => (
                          <td
                            key={cellIdx}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {typeof value === 'number' ? value.toFixed(4) : value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {results.confusion_matrix && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium mb-3">Confusion Matrix</h4>
                  <img 
                    src={results.confusion_matrix} 
                    alt="Confusion Matrix" 
                    className="max-w-full h-auto mx-auto"
                  />
                </div>
              )}

              {results.shap_plot && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium mb-3">SHAP Feature Importance</h4>
                  <img 
                    src={results.shap_plot} 
                    alt="SHAP Values" 
                    className="max-w-full h-auto mx-auto"
                  />
                </div>
              )}

              <a
                href={results.csv_url}
                download
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Download Predictions CSV
              </a>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-black text-gray-400 py-8 border-t border-gray-600">
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

export default Predictions;
