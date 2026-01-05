import os
import datetime
import requests
import pandas as pd
import numpy as np
from influxdb_client import InfluxDBClient
from pprint import pprint
from get_data import fetch_day_summary

class DataLoader:
    def __init__(self):
        # InfluxDB Config
        self.url = os.environ.get("INFLUXDB_URL", "http://influxdb:8086")

        # obviously shouldn't be here, but idc
        self.token = os.environ.get("INFLUXDB_TOKEN_IOT_DATA_READ", "G0G2nQRnO3O8dlB_TWvK-vAix1Z5ss-N64V5tT0IweD03cREVmKgvPpWt4MRaxSr0GCUHzvnt4IlGJKRW_x1cw==")

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

    # def get_weather_live(self):
    #     """
    #     Fetches current weather from OpenWeatherMap One Call API.
    #     """
    #     if not self.weather_api_key:
    #         print("[WARNING] No OpenWeather API Key. Using mock weather.")
    #         return {
    #             'temp': 15.0, 'humidity': 60, 'clouds': 50, 'wind_speed': 5.0
    #         }

    #     url = f"https://api.openweathermap.org/data/3.0/onecall?lat={self.lat}&lon={self.lon}&exclude=minutely,hourly,alerts&appid={self.weather_api_key}&date={datetime.date.today().isoformat()}"
    #     try:
    #         r = requests.get(url, timeout=5)
    #         r.raise_for_status()
    #         data = r.json()
    #         current = data["current"]
    #         print(f"[SYSTEM] Connected to Weather API")
    #         return {
    #             'temp': current.get('temp', 15.0),
    #             'humidity': current.get('humidity', 60),
    #             'clouds': current.get('clouds', 0),
    #             'wind_speed': current.get('wind_speed', 0.0)
    #         }
    #     except Exception as e:
    #         print(f"[ERROR] Weather API failed: {e}")
    #         return {'temp': 15.0, 'humidity': 60, 'clouds': 50, 'wind_speed': 5.0}


    def get_daily_weather_summary(self):
        """
        Fetches daily summary for today from OpenWeatherMap.
        """
        if not self.weather_api_key:
            print("[WARNING] No OpenWeather API Key. Using mock daily summary.")
            return {
                'temperature': {'max': 15.0, 'min': 10.0, 'afternoon': 15.0},
                'precipitation': {'total': 0.0},
                'humidity': {'afternoon': 60},
                'cloud_cover': {'afternoon': 50},
                'wind': {'max': {'speed': 5.0}}
            }

        try:
            today = datetime.date.today()
            data = fetch_day_summary(
                target_date=today,
                api_key=self.weather_api_key,
                lat=self.lat,
                lon=self.lon,
            )
            print(f"[SYSTEM] Connected to Weather API")
            return data
        except Exception as e:
            print(f"[ERROR] Weather Daily Summary API failed: {e}")
            return {
                'temperature': {'max': 15.0, 'min': 10.0, 'afternoon': 15.0},
                'precipitation': {'total': 0.0},
                'humidity': {'afternoon': 60},
                'cloud_cover': {'afternoon': 50},
                'wind': {'max': {'speed': 5.0}}
            }

    def get_real_time_state(self):
        """
        Aggregates all data into the format expected by the model.
        """
        vol_pct = self.get_current_dam_level()
        # weather_live = self.get_weather_live() # Optional, if we still need live current temp
        daily_summary = self.get_daily_weather_summary()
        now = datetime.datetime.now()
        
        # Safe access with defaults in case of missing keys
        temps = daily_summary.get('temperature', {})
        precip = daily_summary.get('precipitation', {})
        humidity = daily_summary.get('humidity', {})
        clouds = daily_summary.get('cloud_cover', {})
        wind = daily_summary.get('wind', {})
        wind_max = wind.get('max', {})
        
        current_data = {
            'water_volume_pct': vol_pct,
            'precip_total_mm': precip.get('total', 0.0),
            'temp_max_C': temps.get('max', 15.0),
            'temp_min_C': temps.get('min', 15.0), 
            'temp_afternoon_C': temps.get('afternoon', 15.0),
            'humidity_afternoon': float(humidity.get('afternoon', 60)),
            'clouds_afternoon': float(clouds.get('afternoon', 50)),
            'wind_max_speed': float(wind_max.get('speed', 5.0)),
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
