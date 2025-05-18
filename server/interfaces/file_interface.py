
from flask import jsonify
import pandas as pd
import os
import io

class FileInterface:
    def __init__(self, app):
        self.app = app
        self.stored_df = None
        self.upload_folder = os.path.join('server', 'uploads')
        
    def list_files(self):
        try:
            files = [f for f in os.listdir(self.upload_folder) if f.endswith('.csv')]
            return jsonify({'files': files})
        except Exception as e:
            return jsonify({'error': str(e), 'files': []})

    def handle_file_upload(self, request):
        try:
            # Handle existing file selection
            if 'filename' in request.form:
                return self._load_existing_file(request.form['filename'])
            
            # Handle new file upload
            elif 'file' in request.files:
                return self._handle_new_file_upload(request.files['file'])
            
            return jsonify({'error': 'No file provided'}), 400
            
        except Exception as e:
            return jsonify({'error': f'Failed to process file: {str(e)}'}), 500

    def _load_existing_file(self, filename):
        file_path = os.path.join(self.upload_folder, filename)
        if not os.path.exists(file_path):
            return jsonify({'error': f'File {filename} not found'}), 400

        try:
            df = pd.read_csv(file_path, encoding='utf-8')
            self.stored_df = df
            return self._generate_analysis_response(df, filename, file_path)
        except Exception as e:
            return jsonify({'error': f'Failed to read CSV file: {str(e)}'}), 400

    def _handle_new_file_upload(self, file):
        if file.filename == '' or not file.filename.endswith('.csv'):
            return jsonify({'error': 'Invalid file'}), 400

        file_path = os.path.join(self.upload_folder, file.filename)
        file.save(file_path)
        
        try:
            df = pd.read_csv(file_path)
            self.stored_df = df
            return self._generate_analysis_response(df, file.filename, file_path)
        except Exception as e:
            os.remove(file_path)
            return jsonify({'error': f'Failed to process file: {str(e)}'}), 400

    def _generate_analysis_response(self, df, filename, file_path):
        info_buffer = io.StringIO()
        df.info(buf=info_buffer)
        
        analysis = {
            'num_records': f"{len(df):,}",
            'columns': df.columns.tolist(),
            'column_types': {col: str(df[col].dtype) for col in df.columns},
            'info': info_buffer.getvalue(),
            'describe': df.describe(include='all').to_dict(),
            'null_counts': df.isnull().sum().to_dict(),
            'preview': df.head(10).to_dict(orient='records')
        }
        
        return jsonify({
            'filename': filename,
            'size': os.path.getsize(file_path),
            'analysis': analysis,
            'message': 'File processed successfully!'
        })
