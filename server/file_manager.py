
import pandas as pd
import os
import logging

class FileManager:
    def __init__(self, upload_folder='uploads'):
        self.upload_folder = os.path.join('server', upload_folder)
        os.makedirs(upload_folder, exist_ok=True)
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def list_uploaded_files(self):
        """List all CSV files in the uploads folder"""
        try:
            files = [f for f in os.listdir(self.upload_folder) if f.endswith('.csv')]
            return files
        except Exception as e:
            self.logger.error(f"Error listing files: {str(e)}")
            return []

    def validate_and_fix_file(self, file_path):
        """Validate and fix common issues in the uploaded CSV file"""
        try:
            # First check if file exists and is not empty
            if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
                self.logger.error("File is empty or does not exist")
                return False, None
                
            # Try reading with different encodings if needed
            for encoding in ['utf-8', 'latin1', 'iso-8859-1']:
                try:
                    df = pd.read_csv(file_path, encoding=encoding)
                    if df.empty or len(df.columns) == 0:
                        continue
                    fixed = False
                    break
                except:
                    continue
            else:
                self.logger.error("Could not parse CSV file with any encoding")
                return False, None
            
            # Fix 1: Remove duplicate rows
            initial_rows = len(df)
            df = df.drop_duplicates()
            if len(df) < initial_rows:
                fixed = True
                self.logger.info(f"Removed {initial_rows - len(df)} duplicate rows")

            # Fix 2: Convert date columns
            date_columns = df.select_dtypes(include=['object']).columns
            for col in date_columns:
                try:
                    if df[col].str.match(r'\d{4}-\d{2}-\d{2}').any():
                        df[col] = pd.to_datetime(df[col])
                        fixed = True
                        self.logger.info(f"Converted {col} to datetime")
                except:
                    pass

            # Fix 3: Handle missing values
            if df.isnull().any().any():
                numeric_cols = df.select_dtypes(include=['float64', 'int64']).columns
                for col in numeric_cols:
                    if df[col].isnull().any():
                        df[col] = df[col].fillna(df[col].mean())
                        fixed = True
                
                categorical_cols = df.select_dtypes(include=['object']).columns
                for col in categorical_cols:
                    if df[col].isnull().any():
                        df[col] = df[col].fillna(df[col].mode()[0])
                        fixed = True
                
                self.logger.info("Fixed missing values")

            if fixed:
                new_path = file_path.replace('.csv', '_fixed.csv')
                df.to_csv(new_path, index=False)
                return True, new_path
            
            return False, file_path

        except Exception as e:
            self.logger.error(f"Error processing file: {str(e)}")
            return False, None
