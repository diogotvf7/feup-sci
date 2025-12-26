import pandas as pd
import numpy as np
import pickle
import json
import sys
from pathlib import Path

# ==============================================================================
# CONFIGURATION
# ==============================================================================
# Path to the trained model file exported from the Jupyter Notebook
SCRIPT_DIR = Path(__file__).resolve().parent

PROJECT_ROOT = SCRIPT_DIR.parent

MODEL_DIR = PROJECT_ROOT / 'models'

MODEL_FILENAME = MODEL_DIR / 'dam_forecast_model.pkl'

def load_inference_artifacts():
    """
    Loads the trained model, feature list, and hyperparameters from the .pkl file.
    
    Returns:
        tuple: (model, feature_list, params)
    """
    try:
        with open(MODEL_FILENAME, 'rb') as f:
            artifacts = pickle.load(f)
        print("✅ [SYSTEM] Model artifacts loaded successfully.")
        return artifacts['model'], artifacts['features'], artifacts['best_params']
    except FileNotFoundError:
        print(f"❌ [ERROR] Model file '{MODEL_FILENAME}' not found. Please export it from the notebook first.")
        sys.exit(1)

def engineer_realtime_features(current_state, history_df):
    """
    TRANSFORMS raw data into Physics-Informed Features expected by the XGBoost model.
    
    Logic:
    The model doesn't just look at 'today'. It needs context about the hydrological state:
    1. Inertia: Is the water level rising or falling? (Volume Change)
    2. Saturation: How wet is the soil? (Cumulative Precipitation 15d/30d)
    3. Lags: What was the volume 7 days ago?
    
    Args:
        current_state (dict): Dictionary with today's raw values (Volume, Temp, Rain, etc.)
        history_df (pd.DataFrame): Dataframe with the last 30 days of data (for rolling windows).
        
    Returns:
        pd.DataFrame: A single-row DataFrame ready for prediction.
    """
    
    # 1. Convert input dict to DataFrame
    input_df = pd.DataFrame([current_state])
    
    # --- A. INERTIA (Flow Dynamics) ---
    # Logic: Calculate the rate of change (velocity). 
    # If today is higher than yesterday, the flood wave is likely continuing.
    vol_yesterday = history_df.iloc[-1]['water_volume_pct']
    input_df['vol_change_1d'] = current_state['water_volume_pct'] - vol_yesterday
    
    # Calculate trend (acceleration) over 3 days
    input_df['vol_change_3d_mean'] = history_df['water_volume_pct'].diff().tail(3).mean()
    
    # --- B. SOIL SATURATION (The "Sponge" Effect) ---
    # Logic: The dam fills faster if the ground is already wet. 
    # We sum up the rain from the past 3, 7, 15, and 30 days to estimate soil saturation.
    input_df['precip_3d_sum'] = history_df['precip_total_mm'].tail(3).sum()
    input_df['precip_7d_sum'] = history_df['precip_total_mm'].tail(7).sum()
    input_df['precip_15d_sum'] = history_df['precip_total_mm'].tail(15).sum()
    input_df['precip_30d_sum'] = history_df['precip_total_mm'].tail(30).sum()
    
    # --- C. LAGS (Autoregression) ---
    # Logic: Provide the model with specific past values to capture weekly cycles.
    input_df['water_volume_pct_lag_1'] = history_df.iloc[-1]['water_volume_pct'] # Yesterday
    input_df['water_volume_pct_lag_2'] = history_df.iloc[-2]['water_volume_pct']
    input_df['water_volume_pct_lag_3'] = history_df.iloc[-3]['water_volume_pct']
    input_df['water_volume_pct_lag_7'] = history_df.iloc[-7]['water_volume_pct']
    input_df['water_volume_pct_lag_14'] = history_df.iloc[-14]['water_volume_pct']

    # Note: 'month' and 'dayofyear' should already be in current_state from the source
    
    return input_df

def make_prediction(model, input_features, feature_list, current_volume):
    """
    Runs the XGBoost model and reconstructs absolute values from predicted Deltas.
    """
    # 1. Align Features
    # Ensure columns match exactly what the model was trained on (order matters!)
    # Fill missing weather forecast columns with 0.0 if not provided by Node-RED (Safety fallback)
    for col in feature_list:
        if col not in input_features.columns:
            input_features[col] = 0.0 
            
    final_input = input_features[feature_list]
    
    # 2. Predict Deltas (The model outputs the CHANGE in volume, not the volume itself)
    # output shape: [delta_day1, delta_day2, ..., delta_day7]
    pred_deltas = model.predict(final_input)[0]
    
    # 3. Reconstruct Absolute Values
    # Forecast = Current_Volume + Predicted_Change
    # Example: If Current is 80% and Delta is +2%, Forecast is 82%
    forecast_abs = current_volume + pred_deltas
    
    return forecast_abs

# ==============================================================================
# MAIN EXECUTION (ENTRY POINT FOR NODE-RED)
# ==============================================================================
if __name__ == "__main__":
    # --- STEP 1: LOAD BRAIN ---
    model, features, params = load_inference_artifacts()
    
    # --- STEP 2: RECEIVE INPUT (SIMULATED FOR THIS SCRIPT) ---
    # In production, these values would come from Node-RED command line args or API request
    print("\n[SYSTEM] Simulating input data reception...")
    
    # ===== NORMAL DATA FOR TESTING =====

    # # MOCK: Current data (Today)
    # current_data = {
    #     'water_volume_pct': 84.5,      # Current Dam Level
    #     'precip_total_mm': 15.2,       # Today's Rain
    #     'temp_max_C': 16.5,
    #     'temp_min_C': 9.2,
    #     'temp_afternoon_C': 14.0,
    #     'humidity_afternoon': 82.0,
    #     'clouds_afternoon': 90.0,
    #     'wind_max_speed': 12.5,
    #     'month': 10,
    #     'dayofyear': 285
    # }
    
    # # MOCK: History Cache (Last 30 days) - Required for rolling sums/lags
    # # Node-RED needs to maintain a small database or CSV of past days
    # print("[SYSTEM] Loading history cache for feature engineering...")
    # history_mock = pd.DataFrame({
    #     'water_volume_pct': np.linspace(80, 84, 30), # Simulating a slow rise
    #     'precip_total_mm': np.random.uniform(0, 10, 30)
    # })

    # ===== END NORMAL DATA FOR TESTING =====

    # ===== DRY DATA FOR TESTING =====

    # MOCK: Current data (Today)
    current_data = {
        'water_volume_pct': 18.5,      # Current Dam Level
        'precip_total_mm': 0.0,       # Today's Rain
        'temp_max_C': 28.0,
        'temp_min_C': 18.0,
        'temp_afternoon_C': 26.0,
        'humidity_afternoon': 35.0,
        'clouds_afternoon': 5.0,
        'wind_max_speed': 8.0,
        'month': 8,
        'dayofyear': 230
    }
    
    # MOCK: History Cache (Last 30 days) - Required for rolling sums/lags
    # Node-RED needs to maintain a small database or CSV of past days
    print("[SYSTEM] Loading history cache for feature engineering...")
    history_mock = pd.DataFrame({
        'water_volume_pct': np.linspace(22.0, 18.5, 30), # Simulating a slow rise
        'precip_total_mm': np.random.uniform(0, 0.5, 30)
    })

    # ===== END DRY DATA FOR TESTING =====
    
    try:
        # --- STEP 3: PROCESS PHYSICS ---
        print("[SYSTEM] Engineering features (Inertia, Saturation, Lags)...")
        processed_input = engineer_realtime_features(current_data, history_mock)
        
        # --- STEP 4: PREDICT ---
        print("[SYSTEM] Running XGBoost Multi-Horizon Forecast...")
        forecast = make_prediction(model, processed_input, features, current_data['water_volume_pct'])
        
        # --- STEP 5: GENERATE JSON OUTPUT ---
        # This is what Node-RED parses to update the Dashboard
        output_payload = {
            "status": "success",
            "timestamp": "2025-10-25T12:00:00Z", # Should be dynamic
            "current_level": float(current_data['water_volume_pct']),
            "forecast_7days": {
                f"day_{i+1}": round(float(val), 2) for i, val in enumerate(forecast)
            },
            "safety_alert": (
                "CRITICAL_OVERFLOW" if any(float(v) > 90 for v in forecast)
                else "DROUGHT_WARNING" if any(float(v) < 20 for v in forecast)
                else "NORMAL"
            )
        }
        
        print("\n" + "="*40)
        print(" FINAL JSON OUTPUT (FOR NODE-RED)")
        print("="*40)
        print(json.dumps(output_payload, indent=4))
        print("="*40)
        
    except Exception as e:
        error_payload = {"status": "error", "message": str(e)}
        print(json.dumps(error_payload))
        sys.exit(1)