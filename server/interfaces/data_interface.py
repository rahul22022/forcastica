
from flask import jsonify
import pandas as pd
import os

class DataInterface:
    def __init__(self, app):
        self.app = app
        self.cleansed_dir = os.path.join('server', 'cleansed_data')
        os.makedirs(self.cleansed_dir, exist_ok=True)

    def get_current_data(self, stored_df):
        if stored_df is None:
            return jsonify({'error': 'No data available'}), 400
        return jsonify({'data': stored_df.to_dict()}), 200

    def remove_columns(self, request, stored_df):
        if stored_df is None:
            return jsonify({'error': 'No data available'}), 400

        try:
            data = request.json
            columns = data.get('columns', [])
            original_file = data.get('filename', '')

            valid_columns = [col for col in columns if col in stored_df.columns]
            if valid_columns:
                stored_df = stored_df.drop(columns=valid_columns)

            new_filename = None
            if original_file:
                base_name = original_file.rsplit('.', 1)[0]
                new_filename = f"{base_name}_v1.csv"
                file_path = os.path.join(self.cleansed_dir, new_filename)
                stored_df.to_csv(file_path, index=False)

            return jsonify({
                'data': stored_df.to_dict(),
                'message': 'Columns removed successfully',
                'processed_file': new_filename
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    def save_cleansed(self, request, stored_df):
        if stored_df is None:
            return jsonify({'error': 'No data available'}), 400

        data = request.json
        filename = data.get('filename', 'cleansed_data.csv')
        save_path = os.path.join(self.cleansed_dir, filename)

        try:
            stored_df.to_csv(save_path, index=False)
            return jsonify({
                'message': 'Data saved successfully',
                'path': save_path
            })
        except Exception as e:
            return jsonify({'error': f'Failed to save file: {str(e)}'}), 500
