import os
import datetime
import requests
import pandas as pd
import numpy as np
from influxdb_client import InfluxDBClient

class DataLoader:
    def __init__(self):
        # InfluxDB Config
        self.url = os.environ.get("INFLUXDB_URL", "http://localhost:8086")

        # obviously shouldn't be here, but idc
        self.token = os.environ.get("INFLUXDB_TOKEN_IOT_DATA_READ", "AefZaztP0AXP2gALPUW4eHGhOhiSGqe")

        self.org = os.environ.get("INFLUXDB_ORG", "SCI")
        # NOTE: Sensors are in 'iot_data' 
        # Writing is to 'ml-predictions', reading is from 'iot_data'.
        self.bucket = os.environ.get("INFLUXDB_SENSOR_BUCKET", "iot_data") 

        # OpenWeatherMap Config
        self.weather_api_key = os.environ.get("OPENWEATHER_API_KEY")

        # Hardcoded in get_data.py too
        self.lat = 41.6513969
        self.lon = -8.2336394

        self.client = InfluxDBClient(url=self.url, token=self.token, org=self.org)
        self.query_api = self.client.query_api()

    def _get_sensor_value(self, measurement, field="value", window="-5m"):
        """
        Get the latest value for a specific sensor measurement from InfluxDB.
        """
        query = f'''
        from(bucket: "{self.bucket}")
            |> range(start: {window})
            |> filter(fn: (r) => r["_measurement"] == "{measurement}")
            |> filter(fn: (r) => r["_field"] == "{field}")
            |> last()
        '''
        try:
            result = self.query_api.query(org=self.org, query=query)
            if not result:
                return None
            for table in result:
                for record in table.records:
                    return record.get_value()
        except Exception as e:
            print(f"[ERROR] InfluxDB Query Failed ({measurement}): {e}")
            return None
        return None

    def get_current_dam_level(self):
        """
        Fetches 'distance' from InfluxDB and converts to Volume %.
        """
        vol_pct = self._get_sensor_value("distance", field="percentage")
        if vol_pct is None:
            print("[WARNING] No distance data found. Using default 50%.")
            return 50.0 # Safety fallback
        return vol_pct

    def get_weather_live(self):
        """
        Fetches current weather from OpenWeatherMap One Call API.
        """
        if not self.weather_api_key:
            print("[WARNING] No OpenWeather API Key. Using mock weather.")
            return {
                'temp': 15.0, 'humidity': 60, 'clouds': 50, 'wind_speed': 5.0
            }

        url = f"https://api.openweathermap.org/data/3.0/onecall?lat={self.lat}&lon={self.lon}&exclude=minutely,hourly,alerts&units=metric&appid={self.weather_api_key}"
        try:
            r = requests.get(url, timeout=5)
            r.raise_for_status()
            data = r.json()
            current = data.get('current', {})
            return {
                'temp': current.get('temp', 15.0),
                'humidity': current.get('humidity', 60),
                'clouds': current.get('clouds', 0),
                'wind_speed': current.get('wind_speed', 0.0)
            }
        except Exception as e:
            print(f"[ERROR] Weather API failed: {e}")
            return {'temp': 15.0, 'humidity': 60, 'clouds': 50, 'wind_speed': 5.0}

    def get_real_time_state(self):
        """
        Aggregates all data into the format expected by the model.
        """
        vol_pct = self.get_current_dam_level()
        weather = self.get_weather_live()
        
        now = datetime.datetime.now()
        
        current_data = {
            'water_volume_pct': vol_pct,
            'precip_total_mm': 0.0, # TODO: Get from rain gauge or API daily summary?
            'temp_max_C': weather['temp'], # Approx
            'temp_min_C': weather['temp'], # Approx
            'temp_afternoon_C': weather['temp'],
            'humidity_afternoon': float(weather['humidity']),
            'clouds_afternoon': float(weather['clouds']),
            'wind_max_speed': float(weather['wind_speed']),
            'month': now.month,
            'dayofyear': now.timetuple().tm_yday
        }
        return current_data

    def get_history_df(self):
        """
        Mock history for now, but in future should query last 30 days from InfluxDB.
        """
        # TODO: Implement proper history query
        # For prototype, we just generate mock history that aligns with current level
        current_vol = self.get_current_dam_level()
        
        history_mock = pd.DataFrame({
            'water_volume_pct': np.linspace(current_vol-5, current_vol, 30),
            'precip_total_mm': np.random.uniform(0, 2, 30)
        })
        return history_mock
