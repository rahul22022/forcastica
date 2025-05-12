from flask import Flask, request, jsonify, send_from_directory, make_response
from model_trainer import ModelTrainer
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
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

UPLOAD_FOLDER = 'uploads'
IMAGES_FOLDER = 'images'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(IMAGES_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(IMAGES_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# === Global DataFrame ===
stored_df = None


# === Apply CORS Headers to All Responses ===
@app.after_request
def apply_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers[
        'Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response


import yaml


# === Routes ===
@app.route('/')
def home():
    return "🚀 Forcastica Flask API ready."


@app.route('/analyze-data', methods=['GET'])
def analyze_data():
    global stored_df
    if stored_df is None:
        return jsonify({'error': 'No data available'}), 400
        
    # Convert categorical columns to numeric
    for column in stored_df.select_dtypes(include='object').columns:
        stored_df[column] = stored_df[column].astype('category').cat.codes
        
    # Generate correlation matrix
    correlation_matrix = stored_df.corr()
    
    # Create plots
    plt.figure(figsize=(12, 8))
    sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm')
    heatmap_path = os.path.join(IMAGES_FOLDER, 'correlation_heatmap.png')
    plt.savefig(heatmap_path)
    plt.close()
    
    # Generate pairplot
    sns.pairplot(stored_df)
    pairplot_path = os.path.join(IMAGES_FOLDER, 'pairplot.png')
    plt.savefig(pairplot_path)
    plt.close()
    
    return jsonify({
        'correlation_matrix': correlation_matrix.to_dict(),
        'plots': ['correlation_heatmap.png', 'pairplot.png']
    })

@app.route('/select-model', methods=['POST'])
def select_model():
    global stored_df
    if stored_df is None:
        return jsonify({'error': 'No data available'}), 400

    data = request.json
    prediction_type = data.get('predictionType')
    target_variable = data.get('targetVariable')

    if target_variable not in stored_df.columns:
        return jsonify({
            'error':
            f'Target variable {target_variable} not found in dataset'
        }), 400

    try:
        # Load appropriate model configuration
        model_file = 'models/classification.yml' if prediction_type == 'classification' else 'models/time_series.yml'
        with open(model_file, 'r') as f:
            models = yaml.safe_load(f)

        # Select best model based on data characteristics
        if prediction_type == 'classification':
            if stored_df[target_variable].nunique() == 2:
                selected_model = next(m for m in models['models']
                                      if m['name'] == 'Logistic Regression')
            else:
                selected_model = next(m for m in models['models']
                                      if m['name'] == 'Random Forest')
        else:
            if stored_df.index.dtype.name == 'datetime64[ns]':
                selected_model = next(m for m in models['time_series_models']
                                      if m['name'] == 'SARIMA')
            else:
                selected_model = next(m for m in models['time_series_models']
                                      if m['name'] == 'Prophet')

        return jsonify({
            'message':
            f'Selected model: {selected_model["name"]}\nDescription: {selected_model["description"]}\nParameters: {selected_model["parameters"]}'
        })

    except Exception as e:
        return jsonify({'error': f'Error selecting model: {str(e)}'}), 500


@app.route('/current-data')
def get_current_data():
    global stored_df
    if stored_df is None:
        return jsonify({'error': 'No data available'}), 400
    return jsonify({'data': stored_df.to_dict()}), 200


@app.route('/remove-columns', methods=['POST'])
def remove_columns():
    global stored_df
    if stored_df is None:
        return jsonify({'error': 'No data available'}), 400

    data = request.json
    columns = data.get('columns', [])

    stored_df = stored_df.drop(columns=columns)
    return jsonify({


@app.route('/list-models', methods=['GET'])
def list_models():
    """List all saved models"""
    try:
        models = []
        for file in os.listdir('server/saved_models'):
            if file.endswith('.joblib'):
                models.append(file)
        return jsonify({'models': models})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/run-predictions', methods=['POST'])
def run_predictions():
    """Run predictions using selected model"""
    global stored_df
    try:
        data = request.json
        model_name = data.get('model_name')
        
        if not model_name:
            return jsonify({'error': 'No model selected'}), 400
            
        if stored_df is None:
            return jsonify({'error': 'No data available'}), 400

        # Load the model
        model_path = os.path.join('server/saved_models', model_name)
        import joblib
        model = joblib.load(model_path)
        
        # Get feature columns (all except target)
        problem_type = 'classification' if 'classification' in model_name else 'regression'
        X = stored_df.copy()
        
        # Make predictions
        predictions = model.predict(X)
        
        # Add predictions to dataframe
        df_with_predictions = stored_df.copy()
        df_with_predictions['predicted_value'] = predictions
        
        # Save results to CSV
        output_path = os.path.join('server/uploads', 'predictions.csv')
        df_with_predictions.to_csv(output_path, index=False)
        
        # Return both predictions and file URL
        return jsonify({
            'predictions': df_with_predictions.to_dict('records'),
            'csv_url': '/download/predictions.csv'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download/<filename>')
def download_file(filename):
    """Download a file from the uploads directory"""
    return send_from_directory('server/uploads', filename, as_attachment=True)

@app.route('/train-models', methods=['POST'])
def train_models():
    global stored_df
    if stored_df is None:
        return jsonify({'error': 'No data available'}), 400

    try:
        data = request.json
        target_column = data.get('target_column')
        problem_type = data.get('problem_type', 'classification')
        
        if target_column not in stored_df.columns:
            return jsonify({'error': f'Target column {target_column} not found'}), 400

        X = stored_df.drop(columns=[target_column])
        y = stored_df[target_column]

        trainer = ModelTrainer()
        results = trainer.train_and_evaluate_all_models(X, y, problem_type)

        return jsonify({'results': results})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


        'data': stored_df.to_dict(),
        'message': 'Columns removed successfully'
    }), 200


@app.route('/handle-nulls', methods=['POST'])
def handle_nulls():
    global stored_df
    if stored_df is None:
        return jsonify({'error': 'No data available'}), 400

    data = request.json
    columns = data.get('columns', [])
    action = data.get('action')

    if action == 'remove':
        stored_df = stored_df.dropna(subset=columns)
    elif action == 'mean':
        stored_df[columns] = stored_df[columns].fillna(
            stored_df[columns].mean())
    elif action == 'mode':
        stored_df[columns] = stored_df[columns].fillna(
            stored_df[columns].mode().iloc[0])

    return jsonify({
        'data': stored_df.to_dict(),
        'message': 'Null values handled successfully'
    }), 200


from file_manager import FileManager

file_manager = FileManager()

@app.route('/list-files', methods=['GET'])
def list_files():
    files = file_manager.list_uploaded_files()
    return jsonify({'files': files})

@app.route('/upload', methods=['POST', 'OPTIONS'])
def upload_file():
    global stored_df

    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', '*')
        response.headers.add('Access-Control-Allow-Methods', '*')
        return response, 200

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
            was_fixed, final_path = file_manager.validate_and_fix_file(file_path)
            if was_fixed:
                df = pd.read_csv(final_path)
                return jsonify({
                    'message': 'File uploaded and fixed successfully',
                    'fixed': True,
                    'original_file': file.filename,
                    'fixed_file': os.path.basename(final_path)
                })
            else:
                df = pd.read_csv(file_path)
        except Exception as e:
            return jsonify({'error': f'Failed to save file: {str(e)}'}), 500

        try:
            df = pd.read_csv(file_path)
        except Exception as e:
            return jsonify({'error':
                            f'Failed to read CSV file: {str(e)}'}), 400

        if df.empty:
            return jsonify({'error': 'The CSV file is empty'}), 400

        # Analyze unique values in columns
        unique_analysis = {}
        for column in df.columns:
            unique_count = df[column].nunique()
            total_count = len(df)
            unique_ratio = unique_count / total_count
            is_unique_identifier = unique_ratio > 0.9  # 90% unique values threshold

            unique_analysis[column] = {
                'unique_count': unique_count,
                'total_count': total_count,
                'unique_ratio': unique_ratio,
                'is_unique_identifier': is_unique_identifier,
                'null_count': df[column].isnull().sum()
            }

        stored_df = df

        # Generate data analysis
        info_buffer = io.StringIO()
        df.info(buf=info_buffer)
        info_str = info_buffer.getvalue()

        # Format numeric columns
        df_preview = df.head(10).copy()
        for column in df_preview.columns:
            if df_preview[column].dtype in ['float64', 'int64']:
                df_preview[column] = df_preview[column].apply(
                    lambda x: f"{x:,.2f}"
                    if isinstance(x, float) else f"{x:,}")
            else:
                df_preview[column] = df_preview[column].astype(str)

        # Get column types for frontend formatting
        column_types = {col: str(df[col].dtype) for col in df.columns}

        analysis = {
            'num_records': f"{len(df):,}",
            'columns': df.columns.tolist(),
            'column_types': column_types,
            'unique_analysis': unique_analysis,
            'info': info_str,
            'describe': {
                col: {
                    k: f"{v:,.2f}" if isinstance(v, float) else str(v)
                    for k, v in stats.items()
                }
                for col, stats in df.describe(include='all').to_dict().items()
            },
            'null_counts': {
                col: f"{count:,}"
                for col, count in df.isnull().sum().to_dict().items()
            },
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

        def convert_np_values(obj):
            if isinstance(obj, dict):
                return {k: convert_np_values(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_np_values(x) for x in obj]
            elif pd.api.types.is_integer_dtype(type(obj)):
                return int(obj)
            elif pd.isna(obj):
                return None
            return obj

        cleaned_analysis = clean_nan(analysis)
        converted_analysis = convert_np_values(cleaned_analysis)

        return jsonify({
            'filename': file.filename,
            'size': int(os.path.getsize(file_path)),  # Convert to standard int
            'analysis': converted_analysis,
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
    app.run(host='localhost', port=5000, debug=True, use_reloader=False)
