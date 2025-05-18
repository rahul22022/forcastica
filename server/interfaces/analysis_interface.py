
from flask import jsonify
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

class AnalysisInterface:
    def __init__(self, app):
        self.app = app
        self.images_folder = os.path.join('server', 'images')
        os.makedirs(self.images_folder, exist_ok=True)
        
    def generate_statistics(self, stored_df):
        if stored_df is None:
            return jsonify({'error': 'No data uploaded yet'}), 400

        try:
            # Clean existing images
            for file in os.listdir(self.images_folder):
                if file.endswith('.png'):
                    os.remove(os.path.join(self.images_folder, file))

            # Generate correlation metrics
            correlation_metrics = {}
            numeric_cols = stored_df.select_dtypes(include=['int64', 'float64']).columns
            if len(numeric_cols) > 0:
                correlation_matrix = stored_df[numeric_cols].corr()
                correlation_metrics = correlation_matrix.to_dict()

            # Generate plots
            generated_images = []
            for column in stored_df.columns:
                if stored_df[column].dtype in ['int64', 'float64']:
                    plt.figure()
                    sns.histplot(stored_df[column].dropna(), kde=True)
                    plt.title(f"Distribution of {column}")
                    plt.xlabel(column)
                    plt.tight_layout()

                    image_filename = f"{column}.png"
                    image_path = os.path.join(self.images_folder, image_filename)
                    plt.savefig(image_path)
                    plt.close()
                    generated_images.append(image_filename)

            return jsonify({
                'message': 'Statistics and plots generated',
                'images': generated_images,
                'correlation_metrics': correlation_metrics
            }), 200

        except Exception as e:
            return jsonify({'error': f'Failed to analyze: {str(e)}'}), 500

    def handle_nulls(self, request, stored_df):
        if stored_df is None:
            return jsonify({'error': 'No data available'}), 400

        data = request.json
        columns = data.get('columns', [])
        action = data.get('action')
        original_file = data.get('filename')

        try:
            df = stored_df.copy()
            if action == 'remove':
                df = df.dropna(subset=columns)
            elif action == 'mean':
                df[columns] = df[columns].fillna(df[columns].mean())
            elif action == 'mode':
                df[columns] = df[columns].fillna(df[columns].mode().iloc[0])

            new_filename = None
            if original_file:
                base_name = original_file.rsplit('.', 1)[0]
                new_filename = f"{base_name}_v1.csv"
                cleansed_dir = os.path.join('server', 'cleansed_data')
                os.makedirs(cleansed_dir, exist_ok=True)
                file_path = os.path.join(cleansed_dir, new_filename)
                df.to_csv(file_path, index=False)

            return jsonify({
                'data': df.to_dict(),
                'message': 'Null values handled successfully',
                'processed_file': new_filename
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
