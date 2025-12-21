import os
import datetime
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS

class InfluxDBWriter:
    def __init__(self):
        # Configuration matches docker-compose.yml
        self.url = os.environ.get("INFLUXDB_URL", "http://localhost:8086")

        # idc about the token
        self.token = os.environ.get("INFLUXDB_TOKEN", "JLV2l-ePCBSDq45BCpZx02_vtupJPmSnJ1lnQ5LoJzFJSIxit30n0AMz_wNvaBzQcOyR4JBej3KJ4CLprh5sPw==")
        self.org = os.environ.get("INFLUXDB_ORG", "SCI") 
        self.bucket = os.environ.get("INFLUXDB_BUCKET", "ml-predictions")
        
        # User/Pass needed for V1 compatibility or if V2 has setup
        # For this specific setup (influxdb:2 image), we ideally use a token.
        # If the user only has user/pass, we might need V1 auth or generate a token.
        # Assuming Token for V2 best practice.
        
        print(f"[InfluxDB] Connecting to {self.url}...")
        self.client = InfluxDBClient(url=self.url, token=self.token, org=self.org)
        self.write_api = self.client.write_api(write_options=SYNCHRONOUS)

    def write_forecast(self, payload):
        """
        writes the forecast payload to InfluxDB.
        Payload structure expected:
        {
            "timestamp": "ISO_STRING",
            "current_level": float,
            "forecast_7days": {"day_1": float, ...},
            "safety_alert": "STRING"
        }
        """
        try:
            timestamp = datetime.datetime.now(datetime.timezone.utc)
            if "timestamp" in payload:
                # Basic parsing, might need adjustment based on valid ISO strings
                try:
                    timestamp = datetime.datetime.fromisoformat(payload["timestamp"].replace('Z', '+00:00'))
                except ValueError:
                    pass

            # Point 1: Forecast Status
            p_status = Point("dam_forecast_status") \
                .tag("location", "dam_1") \
                .field("current_level", float(payload["current_level"])) \
                .field("alert_level", payload["safety_alert"]) \
                .time(timestamp, WritePrecision.NS)

            self.write_api.write(bucket=self.bucket, org=self.org, record=p_status)

            # Point 2: Future Predictions (Store each day as a field or separate points?)
            # Storing as separate points with future timestamps is often better for graphing "what was predicted for X date"
            # BUT standard timeseries usually records "at time T we predicted X".
            # Let's store "forecast_day_1", "forecast_day_2" etc. as fields at current timestamp.
            
            p_forecast = Point("dam_predictions") \
                .tag("location", "dam_1") \
                .time(timestamp, WritePrecision.NS)
            
            for key, value in payload["forecast_7days"].items():
                p_forecast.field(key, float(value))
            
            self.write_api.write(bucket=self.bucket, org=self.org, record=p_forecast)
            
            print("[InfluxDB] Successfully wrote forecast data.")
            return True

        except Exception as e:
            print(f"[InfluxDB] Error writing data: {e}")
            return False

    def close(self):
        self.client.close()
