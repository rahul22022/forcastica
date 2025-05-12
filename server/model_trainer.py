
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.metrics import accuracy_score, mean_squared_error, r2_score
from xgboost import XGBClassifier, XGBRegressor
from sklearn.svm import SVC, SVR
import pandas as pd

class ModelTrainer:
    def __init__(self):
        self.classification_models = {
            'random_forest': RandomForestClassifier(n_estimators=100, random_state=42),
            'xgboost': XGBClassifier(random_state=42),
            'logistic_regression': LogisticRegression(random_state=42),
            'svm': SVC(random_state=42)
        }
        
        self.regression_models = {
            'random_forest': RandomForestRegressor(n_estimators=100, random_state=42),
            'xgboost': XGBRegressor(random_state=42),
            'linear_regression': LinearRegression(),
            'svr': SVR()
        }

    def prepare_data(self, X, y, test_size=0.2):
        return train_test_split(X, y, test_size=test_size, random_state=42)

    def train_classification_model(self, X_train, y_train, model_name):
        if model_name not in self.classification_models:
            raise ValueError(f"Model {model_name} not found")
        
        model = self.classification_models[model_name]
        model.fit(X_train, y_train)
        return model

    def train_regression_model(self, X_train, y_train, model_name):
        if model_name not in self.regression_models:
            raise ValueError(f"Model {model_name} not found")
        
        model = self.regression_models[model_name]
        model.fit(X_train, y_train)
        return model

    def evaluate_classification_model(self, model, X_test, y_test):
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        cv_scores = cross_val_score(model, X_test, y_test, cv=5)
        
        return {
            'accuracy': accuracy,
            'cv_scores_mean': cv_scores.mean(),
            'cv_scores_std': cv_scores.std()
        }

    def evaluate_regression_model(self, model, X_test, y_test):
        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        return {
            'mse': mse,
            'rmse': np.sqrt(mse),
            'r2_score': r2
        }

    def train_and_evaluate_all_models(self, X, y, problem_type='classification'):
        X_train, X_test, y_train, y_test = self.prepare_data(X, y)
        results = {}

        if problem_type == 'classification':
            models = self.classification_models
            eval_func = self.evaluate_classification_model
            train_func = self.train_classification_model
        else:
            models = self.regression_models
            eval_func = self.evaluate_regression_model
            train_func = self.train_regression_model

        for model_name in models.keys():
            try:
                model = train_func(X_train, y_train, model_name)
                results[model_name] = eval_func(model, X_test, y_test)
            except Exception as e:
                results[model_name] = f"Error: {str(e)}"

        return results
