from flask import Flask, request, jsonify, send_from_directory, make_response
from flask_cors import CORS
from interfaces.file_interface import FileInterface
from interfaces.analysis_interface import AnalysisInterface
from interfaces.model_interface import ModelInterface
from interfaces.data_interface import DataInterface
import os
import matplotlib
matplotlib.use('Agg')

# === Flask Setup ===
app = Flask(__name__, static_folder='uploads')
CORS(app,
     resources={r"/*": {
         "origins": "*"
     }},
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type'],
     supports_credentials=True)

# Initialize interfaces
file_interface = FileInterface(app)
analysis_interface = AnalysisInterface(app)
model_interface = ModelInterface(app)
data_interface = DataInterface(app)

# Setup directories
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
IMAGES_FOLDER = os.path.join(os.path.dirname(__file__), 'images')
SAVED_MODELS_FOLDER = os.path.join(os.path.dirname(__file__), 'saved_models')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(IMAGES_FOLDER, exist_ok=True)
os.makedirs(SAVED_MODELS_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# === Global DataFrame ===
stored_df = None

# === Apply CORS Headers ===
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
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', '*')
        response.headers.add('Access-Control-Allow-Methods', '*')
        return response, 200

    global stored_df
    result = file_interface.handle_file_upload(request)
    if result[1] == 200:
        stored_df = file_interface.stored_df
    return result

@app.route('/analyze', methods=['GET', 'OPTIONS'])
def generate_statistics():
    if request.method == 'OPTIONS':
        return '', 204
    return analysis_interface.generate_statistics(stored_df)

@app.route('/list-models', methods=['GET'])
def list_models():
    return model_interface.list_models()

@app.route('/select-model', methods=['POST'])
def select_model():
    return model_interface.select_model(request.json, stored_df)

@app.route('/current-data')
def get_current_data():
    return data_interface.get_current_data(stored_df)

@app.route('/remove-columns', methods=['POST'])
def remove_columns():
    global stored_df
    result = data_interface.remove_columns(request, stored_df)
    if result[1] == 200:
        stored_df = result[0].json['data']
    return result

@app.route('/save-cleansed', methods=['POST'])
def save_cleansed():
    return data_interface.save_cleansed(request, stored_df)

@app.route('/handle-nulls', methods=['POST'])
def handle_nulls():
    global stored_df
    result = analysis_interface.handle_nulls(request, stored_df)
    if result[1] == 200:
        stored_df = result[0].json['data']
    return result

@app.route('/images/<filename>', methods=['GET', 'OPTIONS'])
def serve_image(filename):
    if request.method == 'OPTIONS':
        return '', 204
    try:
        response = make_response(send_from_directory(IMAGES_FOLDER, filename))
        response.headers['Access-Control-Allow-Origin'] = '*'
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
    print("Starting Flask server on http://0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=True, use_debugger=True)