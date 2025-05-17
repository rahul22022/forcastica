import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ModelSelection = () => {
  const [predictionType, setPredictionType] = useState('');
  const [targetVariable, setTargetVariable] = useState('');
  const [message, setMessage] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trainingResults, setTrainingResults] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch('/analyze-data');
        if (response.ok) {
          const data = await response.json();
          setAnalysisData(data);
        }
      } catch (error) {
        setMessage('Error fetching analysis: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  const handleTrainModel = async () => {
    try {
      setLoading(true);
      setMessage('Training models... This may take a few minutes.');

      const response = await fetch('/train-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_column: targetVariable || 'logistic',
          problem_type: predictionType || 'classification',
          processed_file: sessionStorage.getItem('processedFile')
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setTrainingResults(data.results);
        setMessage('Models trained successfully!');

        // Only navigate if there's no confusion matrix to display
        if (!data.results.confusion_matrix) {
          navigate('/predictions');
        }
      } else {
        setMessage(data.error || 'Failed to train models');
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
          <Link to="/analysis" className="hover:text-orange-400">Data Analysis</Link>
          <Link to="/model-selection" className="hover:text-orange-400">Model Selection</Link>
        </nav>
      </header>

      <main className="flex-grow p-6">
        {loading ? (
          <div className="text-center">
            <p>Loading analysis...</p>
          </div>
        ) : (
          <>
            <div className="max-w-7xl mx-auto mb-8">
              <h2 className="text-2xl font-bold mb-6">Data Analysis & Model Selection</h2>



              <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-6">Model Configuration</h3>

                <form onSubmit={(e) => { e.preventDefault(); handleTrainModel(); }} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prediction Type
                    </label>
                    <select
                      value={predictionType}
                      onChange={(e) => setPredictionType(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select prediction type</option>
                      <option value="classification">Classification</option>
                      <option value="regression">Regression</option>
                      <option value="time_series">Time Series</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Variable
                    </label>
                    <input
                      type="text"
                      value={targetVariable}
                      onChange={(e) => setTargetVariable(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter the column name to predict"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Training Models...' : 'Train Models'}
                  </button>
                </form>

                {message && (
                  <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-md">
                    {message}
                  </div>
                )}

                {loading ? (
                  <div className="mt-6 flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-lg text-gray-700">Training Models...</p>
                  </div>
                ) : trainingResults && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-3">Training Results</h4>
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
                    {trainingResults.confusion_matrix && (
                      <div className="mt-8">
                        <h4 className="text-lg font-semibold mb-3">Confusion Matrix</h4>
                        <div className="bg-white p-4 rounded-lg shadow-md">
                          <img 
                            src={trainingResults.confusion_matrix} 
                            alt="Confusion Matrix" 
                            className="max-w-full h-auto mx-auto"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
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

export default ModelSelection;