from flask import Flask, request, jsonify, send_from_directory, make_response
from flask_cors import CORS
import os
import io
import pandas as pd
import matplotlib

matplotlib.use('Agg')  # Headless backend
from matplotlib import pyplot as plt
import seaborn as sns

# === Flask Setup ===
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "https://*.replit.dev"]}})  # Enable CORS for all routes

UPLOAD_FOLDER = 'uploads'
IMAGES_FOLDER = 'images'

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(IMAGES_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# === Global DataFrame ===
stored_df = None

# === Apply CORS Headers to All Responses ===
@app.after_request
def apply_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response


# === Routes ===
@app.route('/')
def home():
    return "🚀 Forcastica Flask API ready."


@app.route('/upload', methods=['POST', 'OPTIONS'])
def upload_file():
    global stored_df

    if request.method == 'OPTIONS':
        return '', 204

    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file selected'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'Only CSV files are allowed'}), 400

        if file.content_length > 10 * 1024 * 1024:  # 10MB limit
            return jsonify({'error': 'File size exceeds 10MB limit'}), 400

        # Ensure upload directory exists
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)

        # Ensure upload directory exists
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

        try:
            file.save(file_path)
        except Exception as e:
            return jsonify({'error': f'Failed to save file: {str(e)}'}), 500

        try:
            df = pd.read_csv(file_path)
        except Exception as e:
            return jsonify({'error': f'Failed to read CSV file: {str(e)}'}), 400

        if df.empty:
            return jsonify({'error': 'The CSV file is empty'}), 400

        stored_df = df

        # Generate data analysis
        info_buffer = io.StringIO()
        df.info(buf=info_buffer)
        info_str = info_buffer.getvalue()

        # Convert any non-string data to string format for JSON serialization
        df_preview = df.head(10).copy()
        for column in df_preview.columns:
            df_preview[column] = df_preview[column].astype(str)

        analysis = {
            'num_records': len(df),
            'columns': df.columns.tolist(),
            'info': info_str,
            'describe': df.describe(include='all').to_dict(),
            'null_counts': df.isnull().sum().to_dict(),
            'preview': df_preview.to_dict(orient='records')
        }

        # Convert NaN values to None (null in JSON) before sending
        def clean_nan(obj):
            if isinstance(obj, dict):
                return {k: clean_nan(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [clean_nan(x) for x in obj]
            elif pd.isna(obj):
                return None
            return obj

        cleaned_analysis = clean_nan(analysis)
        return jsonify({
            'filename': file.filename,
            'size': os.path.getsize(file_path),
            'analysis': cleaned_analysis,
            'message': 'File uploaded successfully!'
        })

    except Exception as e:
        return jsonify({'error': f'Failed to process file: {str(e)}'}), 500


@app.route('/analyze', methods=['GET', 'OPTIONS'])
def generate_statistics():
    global stored_df

    if request.method == 'OPTIONS':
        return '', 204

    df = stored_df
    if df is None:
        return jsonify({'error': 'No data uploaded yet'}), 400

    try:
        # Clean up existing images
        for file in os.listdir(IMAGES_FOLDER):
            if file.endswith('.png'):
                os.remove(os.path.join(IMAGES_FOLDER, file))

        generated_images = []

        for column in df.columns:
            if df[column].dtype in ['int64', 'float64']:
                plt.figure()
                sns.histplot(df[column].dropna(), kde=True)
                plt.title(f"Histogram of {column}")
                plt.xlabel(column)
                plt.tight_layout()

                image_filename = f"{column}.png"
                image_path = os.path.join(IMAGES_FOLDER, image_filename)
                plt.savefig(image_path)
                plt.close()

                generated_images.append(image_filename)

        return jsonify({
            'message': 'Statistics and plots generated',
            'images': generated_images
        }), 200

    except Exception as e:
        return jsonify({'error': f'Failed to analyze: {str(e)}'}), 500


@app.route('/images/<filename>', methods=['GET', 'OPTIONS'])
def serve_image(filename):
    if request.method == 'OPTIONS':
        return '', 204

    try:
        response = make_response(send_from_directory(IMAGES_FOLDER, filename))
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        response.headers['Access-Control-Allow-Methods'] = 'GET,OPTIONS'
        return response
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/images', methods=['GET'])
def list_images():
    try:
        files = [f for f in os.listdir(IMAGES_FOLDER) if f.endswith('.png')]
        return jsonify({'images': files})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# === Launch ===
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)