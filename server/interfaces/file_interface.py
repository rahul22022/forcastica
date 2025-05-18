from flask import jsonify, request
import pandas as pd
import os
import io


class FileInterface:

    def __init__(self, app):
        self.app = app
        self.stored_df = None
        self.upload_folder = os.path.join('uploads')
        os.makedirs(self.upload_folder, exist_ok=True)

    def list_files(self):
        try:
            files = [
                f for f in os.listdir(self.upload_folder) if f.endswith('.csv')
            ]
            response = jsonify({'files': files})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        except Exception as e:
            response = jsonify({'error': str(e), 'files': []})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response

    def handle_file_upload(self, request):
        try:
            # Handle existing file selection
            if 'filename' in request.form:
                filename = request.form['filename'].strip()
                if not filename:
                    return jsonify({'error': 'No filename provided'}), 400
                    
                file_path = os.path.join(self.upload_folder, filename)
                if not os.path.exists(file_path):
                    return jsonify({'error': f'File {filename} not found in uploads folder'}), 404
                    
                try:
                    df = pd.read_csv(file_path)
                    self.stored_df = df
                    return self._generate_analysis_response(df, filename, file_path)
                except Exception as e:
                    return jsonify({'error': f'Error reading file: {str(e)}'}), 500

            # Handle new file upload
            elif 'file' in request.files:
                file = request.files['file']
                if file.filename == '' or not file.filename.endswith('.csv'):
                    return jsonify({
                        'error':
                        'Invalid file format. Please upload a CSV file.'
                    }), 400

                file_path = os.path.join(self.upload_folder, file.filename)
                file.save(file_path)
                response = self._process_file(file.filename, file_path)
                return response

            return jsonify({'error': 'No file provided'}), 400

        except Exception as e:
            return jsonify({'error': f'Failed to process file: {str(e)}'}), 500

    def _load_existing_file(self, filename, file_path):
        if not os.path.exists(file_path):
            return jsonify({'error': f'File {filename} not found'}), 400

        try:
            df = pd.read_csv(file_path)
            self.stored_df = df
            return self._generate_analysis_response(df, filename, file_path)
        except Exception as e:
            return jsonify({'error': f'Failed to read file: {str(e)}'}), 500

    def _process_file(self, filename, file_path):
        try:
            df = pd.read_csv(file_path)
            self.stored_df = df
            return self._generate_analysis_response(df, filename, file_path)
        except Exception as e:
            if os.path.exists(file_path):
                os.remove(file_path)
            return jsonify({'error':
                            f'Failed to process CSV file: {str(e)}'}), 500

    def _generate_analysis_response(self, df, filename, file_path):
        try:
            info_buffer = io.StringIO()
            df.info(buf=info_buffer)

            analysis = {
                'num_records': f"{len(df):,}",
                'columns': df.columns.tolist(),
                'column_types': {
                    col: str(df[col].dtype)
                    for col in df.columns
                },
                'info': info_buffer.getvalue(),
                'describe': df.describe(include='all').to_dict(),
                'null_counts': df.isnull().sum().to_dict(),
                'preview': df.head(10).to_dict(orient='records')
            }

            response = jsonify({
                'filename': filename,
                'size': os.path.getsize(file_path),
                'analysis': analysis,
                'message': 'File processed successfully!'
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response

        except Exception as e:
            return jsonify({'error': f'Failed to analyze file: {str(e)}'}), 500
