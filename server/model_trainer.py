
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.metrics import accuracy_score, mean_squared_error, r2_score, mean_absolute_error
from xgboost import XGBClassifier, XGBRegressor
from sklearn.svm import SVC, SVR
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from prophet import Prophet
import warnings
warnings.filterwarnings('ignore')

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

class TimeSeriesModelTrainer:
    def __init__(self):
        self.models = {
            'arima': self._train_arima,
            'sarima': self._train_sarima,
            'prophet': self._train_prophet,
            'holtwinters': self._train_holtwinters
        }

    def prepare_data(self, data, target_col, date_col, test_size=0.2):
        """Prepare time series data for modeling"""
        data = data.sort_values(date_col)
        train_size = int(len(data) * (1 - test_size))
        train = data[:train_size]
        test = data[train_size:]
        return train, test

    def _train_arima(self, train_data, target_col, order=(1,1,1)):
        """Train ARIMA model"""
        model = ARIMA(train_data[target_col], order=order)
        return model.fit()

    def _train_sarima(self, train_data, target_col, order=(1,1,1), seasonal_order=(1,1,1,12)):
        """Train SARIMA model"""
        model = SARIMAX(train_data[target_col], 
                       order=order, 
                       seasonal_order=seasonal_order)
        return model.fit(disp=False)

    def _train_prophet(self, train_data, date_col, target_col):
        """Train Prophet model"""
        df = pd.DataFrame({
            'ds': train_data[date_col],
            'y': train_data[target_col]
        })
        model = Prophet()
        model.fit(df)
        return model

    def _train_holtwinters(self, train_data, target_col, seasonal_periods=12):
        """Train Holt-Winters model"""
        model = ExponentialSmoothing(train_data[target_col],
                                   seasonal_periods=seasonal_periods,
                                   seasonal='add')
        return model.fit()

    def evaluate_model(self, model, test_data, target_col, date_col=None, model_type='arima'):
        """Evaluate time series model"""
        if model_type == 'prophet':
            future = pd.DataFrame({'ds': test_data[date_col]})
            y_pred = model.predict(future)['yhat']
        elif model_type in ['arima', 'sarima']:
            y_pred = model.forecast(len(test_data))
        else:  # holtwinters
            y_pred = model.forecast(len(test_data))

        y_true = test_data[target_col]
        
        return {
            'mse': mean_squared_error(y_true, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_true, y_pred)),
            'mae': mean_absolute_error(y_true, y_pred)
        }

    def train_and_evaluate_all_models(self, data, target_col, date_col):
        """Train and evaluate all time series models"""
        train_data, test_data = self.prepare_data(data, target_col, date_col)
        results = {}

        for model_name, train_func in self.models.items():
            try:
                if model_name == 'prophet':
                    model = train_func(train_data, date_col, target_col)
                else:
                    model = train_func(train_data, target_col)
                
                results[model_name] = self.evaluate_model(
                    model, test_data, target_col, date_col, model_name
                )
            except Exception as e:
                results[model_name] = f"Error: {str(e)}"

        return results
