
from flask import jsonify
import pandas as pd
import os
import io

class FileInterface:
    def __init__(self, app):
        self.app = app
        self.stored_df = None
        self.upload_folder = os.path.join('server', 'uploads')
        os.makedirs(self.upload_folder, exist_ok=True)

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
                filename = request.form['filename']
                file_path = os.path.join(self.upload_folder, filename)
                return self._load_existing_file(filename, file_path)

            # Handle new file upload
            elif 'file' in request.files:
                file = request.files['file']
                if file.filename == '' or not file.filename.endswith('.csv'):
                    return jsonify({'error': 'Invalid file'}), 400
                
                # Save file to uploads folder
                file_path = os.path.join(self.upload_folder, file.filename)
                file.save(file_path)
                
                # Process the file
                return self._process_file(file.filename, file_path)

            return jsonify({'error': 'No file provided'}), 400

        except Exception as e:
            return jsonify({'error': f'Failed to process file: {str(e)}'}), 500

    def _load_existing_file(self, filename, file_path):
        if not os.path.exists(file_path):
            return jsonify({'error': f'File {filename} not found'}), 400

        return self._process_file(filename, file_path)

    def _process_file(self, filename, file_path):
        try:
            df = pd.read_csv(file_path)
            self.stored_df = df
            return self._generate_analysis_response(df, filename, file_path)
        except Exception as e:
            if 'file' in request.files:  # Only remove if it was a new upload
                os.remove(file_path)
            return jsonify({'error': f'Failed to process CSV file: {str(e)}'}), 400

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
