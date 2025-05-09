from flask import Flask, request, jsonify, send_from_directory, make_response
from flask_cors import CORS
import os
import pandas as pd
import matplotlib

matplotlib.use('Agg')  # Headless backend
from matplotlib import pyplot as plt
import seaborn as sns

# === Flask Setup ===
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Enable CORS for all routes

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

    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)

        df = pd.read_csv(file_path)
        stored_df = df

        num_records = len(df)
        column_names = df.columns.tolist()
        records = df.head(100).to_dict(orient='records')

        return jsonify({
            'filename': file.filename,
            'size': os.path.getsize(file_path),
            'num_records': num_records,
            'column_names': column_names,
            'records': records,
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
        existing_images = [f for f in os.listdir(IMAGES_FOLDER) if f.endswith('.png')]
        if existing_images:
            return jsonify({
                'message': 'Using existing histograms',
                'images': existing_images
            }), 200

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
    app.run(debug=True)
