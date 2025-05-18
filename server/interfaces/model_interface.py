
from flask import jsonify
import joblib
import os
import yaml
import matplotlib.pyplot as plt
import shap

class ModelInterface:
    def __init__(self, app):
        self.app = app
        self.saved_models_folder = os.path.join('server', 'saved_models')
        os.makedirs(self.saved_models_folder, exist_ok=True)

    def list_models(self):
        try:
            models = []
            for file in os.listdir(self.saved_models_folder):
                if file.endswith('.joblib'):
                    models.append(file)
            return jsonify({'models': models})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    def select_model(self, data, stored_df):
        if stored_df is None:
            return jsonify({'error': 'No data available'}), 400

        prediction_type = data.get('predictionType')
        target_variable = data.get('targetVariable')

        if target_variable not in stored_df.columns:
            return jsonify({'error': f'Target variable {target_variable} not found in dataset'}), 400

        try:
            model_file = 'models/classification.yml' if prediction_type == 'classification' else 'models/time_series.yml'
            with open(model_file, 'r') as f:
                models = yaml.safe_load(f)

            if prediction_type == 'classification':
                if stored_df[target_variable].nunique() == 2:
                    selected_model = next(m for m in models['models'] if m['name'] == 'Logistic Regression')
                else:
                    selected_model = next(m for m in models['models'] if m['name'] == 'Random Forest')
            else:
                if stored_df.index.dtype.name == 'datetime64[ns]':
                    selected_model = next(m for m in models['time_series_models'] if m['name'] == 'SARIMA')
                else:
                    selected_model = next(m for m in models['time_series_models'] if m['name'] == 'Prophet')

            return jsonify({
                'message': f'Selected model: {selected_model["name"]}\nDescription: {selected_model["description"]}\nParameters: {selected_model["parameters"]}'
            })

        except Exception as e:
            return jsonify({'error': f'Error selecting model: {str(e)}'}), 500
