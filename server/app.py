from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import pandas as pd
import matplotlib

matplotlib.use('Agg')  # Use non-GUI backend
from matplotlib import pyplot as plt
import seaborn as sns

# --- Flask Setup ---
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
IMAGES_FOLDER = 'images'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(IMAGES_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Global in-memory DataFrame storage
stored_df = None

# --- Routes ---

@app.route('/')
def home():
    return "Welcome to the Forcastica Flask API 🚀"


@app.route('/upload', methods=['POST'])
def upload_file():
    global stored_df

    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Save file to uploads folder
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)

        # Load CSV into DataFrame and store globally
        df = pd.read_csv(file_path)
        stored_df = df  # 🔥 Set the global DataFrame

        num_records = len(df)
        column_names = df.columns.tolist()
        records = df.head(10).to_dict(orient='records')

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


@app.route('/analyze', methods=['GET'])
def generate_statistics():
    global stored_df
    df = stored_df

    if df is None:
        return jsonify({'error': 'No data uploaded yet'}), 400

    try:
        # Check if images already exist
        existing_images = [f for f in os.listdir(IMAGES_FOLDER) if f.endswith('.png')]
        if existing_images:
            print("📦 Reusing existing histograms.")
            return jsonify({
                'message': 'Using existing histograms',
                'images': existing_images
            }), 200

        # If no images, generate them
        generated_images = []

        for column in df.columns:
            if df[column].dtype in ['int64', 'float64']:
                print(f"Analyzing: {column}")
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



@app.route('/images/<filename>')
def serve_image(filename):
    return send_from_directory(IMAGES_FOLDER, filename)


@app.route('/images')
def list_images():
    try:
        files = [f for f in os.listdir(IMAGES_FOLDER) if f.endswith('.png')]
        return jsonify({'images': files})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# --- Run Server ---
if __name__ == '__main__':
    app.run(debug=True)
