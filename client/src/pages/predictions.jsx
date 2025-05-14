import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Predictions = () => {
  const [modelsByType, setModelsByType] = useState({
    classification: [],
    regression: [],
    time_series: []
  });
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // List saved models from the server
    const fetchModels = async () => {
      try {
        const response = await fetch('/list-models');
        if (response.ok) {
          const data = await response.json();
          // Organize models by type
          const organized = {
            classification: data.models.filter(m => m.includes('classification')),
            regression: data.models.filter(m => m.includes('regression')),
            time_series: data.models.filter(m => m.includes('time_series'))
          };
          setModelsByType(organized);
        }
      } catch (error) {
        setMessage('Error fetching models: ' + error.message);
      }
    };
    fetchModels();
  }, []);

  const runPredictions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/run-predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_name: selectedModel,
          problem_type: selectedType,
          target_column: selectedModel.split('_')[0]  // Use first part of model name as target
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setMessage('Predictions completed successfully!');
      }
    } catch (error) {
      setMessage('Error running predictions: ' + error.message);
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
          <Link to="/model-selection" className="hover:text-orange-400">Model Selection</Link>
          <Link to="/predictions" className="hover:text-orange-400">Predictions</Link>
        </nav>
      </header>

      <main className="flex-grow p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Run Predictions</h2>

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
                  <option value="time_series">Time Series</option>
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
                        <option value="svm">Support Vector Machine</option>
                        <option value="knn">K-Nearest Neighbors</option>
                        <option value="naive_bayes">Naive Bayes</option>
                      </>
                    ) : selectedType === 'time_series' ? (
                      <>
                        <option value="arima">ARIMA</option>
                        <option value="sarima">SARIMA</option>
                        <option value="sarimax">SARIMAX</option>
                        <option value="prophet">Prophet</option>
                        <option value="lstm">LSTM</option>
                        <option value="gru">GRU</option>
                        <option value="xgboost">XGBoost Regressor</option>
                        <option value="random_forest">Random Forest Regressor</option>
                        <option value="holt_winters">Holt-Winters</option>
                      </>
                    ) : null}
                  </select>
                </div>
              )}
            </div>

            <button
              onClick={runPredictions}
              disabled={!selectedModel || loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Running Predictions...' : 'Run Predictions'}
            </button>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-md">
              {message}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center p-10">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg text-gray-700">{message}</p>
            </div>
          ) : (
            results && (
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
                <div className="mt-4 space-y-4">
                  <a
                    href={results.csv_url}
                    download
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    Download Predictions CSV
                  </a>
                  
                  {results.confusion_matrix && (
                    <div className="mt-6">
                      <h4 className="text-lg font-medium mb-3">Confusion Matrix</h4>
                      <div className="bg-white p-4 rounded-lg shadow">
                        <img 
                          src={results.confusion_matrix} 
                          alt="Confusion Matrix" 
                          className="max-w-full h-auto mx-auto"
                        />
                      </div>
                    </div>
                  )}
                  
                  {results.shap_plot && (
                    <div className="mt-6">
                      <h4 className="text-lg font-medium mb-3">SHAP Feature Importance</h4>
                      <div className="bg-white p-4 rounded-lg shadow">
                        <img 
                          src={results.shap_plot} 
                          alt="SHAP Values" 
                          className="max-w-full h-auto mx-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
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