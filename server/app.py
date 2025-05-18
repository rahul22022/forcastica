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
import plotly.express as px
import plotly.graph_objects as go

# === Flask Setup ===
app = Flask(__name__, static_folder='uploads')
CORS(app, 
     resources={r"/*": {"origins": "*"}},
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type'],
     supports_credentials=True)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

UPLOAD_FOLDER = 'uploads'
IMAGES_FOLDER = 'images'
SAVED_MODELS_FOLDER = 'saved_models'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(IMAGES_FOLDER, exist_ok=True)
os.makedirs(SAVED_MODELS_FOLDER, exist_ok=True)

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

    return jsonify({
        'correlation_matrix': correlation_matrix.to_dict(),
        'plots': ['correlation_heatmap.png']
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

    try:
        data = request.json
        columns = data.get('columns', [])
        original_file = data.get('filename', '')

        # Filter out columns that don't exist
        valid_columns = [col for col in columns if col in stored_df.columns]
        if valid_columns:
            stored_df = stored_df.drop(columns=valid_columns)

        # Save processed file in cleansed_data directory
        new_filename = None
        if original_file:
            base_name = original_file.rsplit('.', 1)[0]
            new_filename = f"{base_name}_v1.csv"
            
            # Ensure cleansed_data directory exists
            cleansed_dir = os.path.join('server', 'cleansed_data')
            os.makedirs(cleansed_dir, exist_ok=True)
            
            file_path = os.path.join(cleansed_dir, new_filename)
            stored_df.to_csv(file_path, index=False)

        return jsonify({
            'data': stored_df.to_dict(),
            'message': 'Columns removed successfully',
            'processed_file': new_filename
        }), 200
    except Exception as e:
        print(f"Error in remove_columns: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/list-models', methods=['GET'])
def list_models():
    """List all saved models"""
    try:
        models = []
        models_dir = os.path.join('server', SAVED_MODELS_FOLDER)
        for file in os.listdir(models_dir):
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
        import shap
        data = request.json
        if not data:
            return jsonify({'error': 'No request data provided'}), 400
            
        print("Received prediction request:", data)  # Debug logging
            
        if stored_df is None:
            return jsonify({'error': 'No dataset loaded. Please upload data first.'}), 400
            
        model_name = data.get('model_name')
        if not model_name:
            return jsonify({'error': 'No model name provided'}), 400
            
        model_name = data.get('model_name')
        problem_type = data.get('problem_type', 'classification')
        target_column = data.get('target_column')

        if not model_name:
            return jsonify({'error': 'No model selected'}), 400
            
        if stored_df is None:
            return jsonify({'error': 'No dataset loaded. Please upload data first.'}), 400

        # Extract target variable from model name (e.g., "status_classification" -> "status")
        target_column = model_name.split('_')[0] if '_' in model_name else target_column
        
        if target_column not in stored_df.columns:
            return jsonify({'error': f'Target column {target_column} not found in dataset'}), 400

        if stored_df is None:
            return jsonify({'error': 'No data available'}), 400

        # Create model filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        model_filename = f"{model_name}_{problem_type}_{timestamp}.joblib"
        model_save_path = os.path.join('server/saved_models', model_filename)

        # Initialize and train the model
        trainer = ModelTrainer()
        if problem_type == 'classification':
            model = trainer.classification_models.get(model_name)
        else:
            model = trainer.regression_models.get(model_name)

        if model is None:
            return jsonify({'error': 'Invalid model selected'}), 400

        # Prepare data
        X = stored_df.drop(columns=[target_column])
        y = stored_df[target_column]
        
        # Split data
        from sklearn.model_selection import train_test_split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train model
        model.fit(X_train, y_train)
        
        # Make predictions
        predictions = model.predict(X_test)
        
        # Calculate SHAP values
        explainer = shap.TreeExplainer(model) if hasattr(model, 'predict_proba') else shap.KernelExplainer(model.predict, X_train)
        shap_values = explainer.shap_values(X_test[:100])  # Limit to 100 samples for performance
        
        # Generate SHAP summary plot
        plt.figure()
        if isinstance(shap_values, list):
            shap_values = shap_values[1]  # For binary classification
        shap.summary_plot(shap_values, X_test[:100], show=False)
        shap_plot_path = os.path.join(IMAGES_FOLDER, f'shap_summary_{timestamp}.png')
        plt.savefig(shap_plot_path)
        plt.close()

        # Save the trained model
        import joblib
        joblib.dump(model, model_save_path)

        # Add predictions to dataframe
        df_with_predictions = stored_df.copy()
        df_with_predictions['predicted_value'] = predictions

        # Save results to CSV
        results_filename = f"predictions_{timestamp}.csv"
        output_path = os.path.join('server/uploads', results_filename)
        df_with_predictions.to_csv(output_path, index=False)

        # Generate confusion matrix if it's a classification problem
        if problem_type == 'classification':
            from sklearn.metrics import confusion_matrix
            import seaborn as sns
            import matplotlib.pyplot as plt
            
            y_true = stored_df[target_column]
            conf_matrix = confusion_matrix(y_true, predictions)
            
            plt.figure(figsize=(10, 8))
            sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues')
            plt.title('Confusion Matrix')
            plt.ylabel('True Label')
            plt.xlabel('Predicted Label')
            
            confusion_matrix_path = os.path.join('images', f'confusion_matrix_{timestamp}.png')
            plt.savefig(confusion_matrix_path)
            plt.close()

        # Return predictions, file URLs and model info
        return jsonify({
            'predictions': df_with_predictions.to_dict('records'),
            'csv_url': f'/download/{results_filename}',
            'confusion_matrix': f'/images/confusion_matrix_{timestamp}.png' if problem_type == 'classification' else None,
            'model_info': {
                'name': model_name,
                'type': problem_type,
                'file': model_filename,
                'timestamp': timestamp
            }
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
        processed_file = data.get('processed_file')
        
        # Use processed file if available
        if processed_file and os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], processed_file)):
            df = pd.read_csv(os.path.join(app.config['UPLOAD_FOLDER'], processed_file))
            if df is not None:
                stored_df = df

        if target_column not in stored_df.columns:
            return jsonify({'error': f'Target column {target_column} not found'}), 400

        X = stored_df.drop(columns=[target_column])
        y = stored_df[target_column]

        trainer = ModelTrainer()
        results = trainer.train_and_evaluate_all_models(X, y, problem_type)

        return jsonify({'results': results})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/save-cleansed', methods=['POST'])
def save_cleansed():
    global stored_df
    if stored_df is None:
        return jsonify({'error': 'No data available'}), 400
        
    data = request.json
    filename = data.get('filename', 'cleansed_data.csv')
    
    # Ensure cleansed_data directory exists
    cleansed_dir = os.path.join('cleansed_data')
    os.makedirs(cleansed_dir, exist_ok=True)
    
    save_path = os.path.join(cleansed_dir, filename)
    
    try:
        stored_df.to_csv(save_path, index=False)
        return jsonify({'message': 'Data saved successfully', 'path': save_path})
    except Exception as e:
        print(f"Error saving file: {str(e)}")  # Log the error
        return jsonify({'error': f'Failed to save file: {str(e)}'}), 500

@app.route('/handle-nulls', methods=['POST'])
def handle_nulls():
    global stored_df
    if stored_df is None:
        return jsonify({'error': 'No data available'}), 400

    data = request.json
    columns = data.get('columns', [])
    action = data.get('action')
    original_file = data.get('filename')

    try:
        if action == 'remove':
            stored_df = stored_df.dropna(subset=columns)
        elif action == 'mean':
            stored_df[columns] = stored_df[columns].fillna(
                stored_df[columns].mean())
        elif action == 'mode':
            stored_df[columns] = stored_df[columns].fillna(
                stored_df[columns].mode().iloc[0])

        # Save processed file with _v1 suffix
        new_filename = None
        if original_file:
            base_name = original_file.rsplit('.', 1)[0]
            new_filename = f"{base_name}_v1.csv"
            
            # Ensure cleansed_data directory exists
            cleansed_dir = os.path.join('server', 'cleansed_data')
            os.makedirs(cleansed_dir, exist_ok=True)
            
            file_path = os.path.join(cleansed_dir, new_filename)
            stored_df.to_csv(file_path, index=False)

        return jsonify({
            'data': stored_df.to_dict(),
            'message': 'Null values handled successfully',
            'processed_file': new_filename
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


from file_manager import FileManager

file_manager = FileManager()

@app.route('/list-files', methods=['GET'])
def list_files():
    try:
        files = file_manager.list_uploaded_files()
        return jsonify({'files': files})
    except Exception as e:
        # Log the error for debugging
        print(f"Error in list_files: {str(e)}")
        return jsonify({'error': str(e), 'files': []})

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
        file_path = None
        
        # Check if this is an existing file selection
        if 'filename' in request.form:
            filename = request.form['filename']
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            if not os.path.exists(file_path):
                return jsonify({'error': f'File {filename} not found'}), 400
                
        # Handle new file upload
        elif 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
                
            if not file.filename.endswith('.csv'):
                return jsonify({'error': 'Only CSV files are allowed'}), 400
                
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(file_path)
        else:
            return jsonify({'error': 'No file provided'}), 400
            
        # Process the file
        df = pd.read_csv(file_path)
            if df.empty:
                return jsonify({'error': 'The CSV file is empty'}), 400
                
        except Exception as e:
            return jsonify({'error': f'Failed to read CSV file: {str(e)}'}), 400

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

        # Calculate correlation metrics
        correlation_metrics = {}
        numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
        if len(numeric_cols) > 0:
            correlation_matrix = df[numeric_cols].corr()
            correlation_metrics = correlation_matrix.to_dict()

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
            'images': generated_images,
            'correlation_metrics': correlation_metrics
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
    print("Starting Flask server on http://0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)