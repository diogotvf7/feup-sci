# this script simulates one sensor multiple outputs and sends data to an MQTT broker

import time
import json
import random
import paho.mqtt.client as mqtt

# --- Configuration ---
BROKER = "192.168.3.35"
PORT = 1883
USERNAME = "kalo"
PASSWORD = "kalo"

# --- Sensor Simulator ---
def get_mqtt_client():
    client = mqtt.Client()
    client.username_pw_set(USERNAME, PASSWORD)
    try:
        client.connect(BROKER, PORT, 60)
        client.loop_start()
        return client
    except Exception as e:
        print(f"Connection failed: {e}")
        return None

def publish_reading(client, sensor_id, kind, value, units):
    # 1. Create the Payload
    payload = {
        "id": sensor_id,
        "kind": kind,       # This becomes the InfluxDB Measurement
        "units": units,     # This becomes a Tag
        "data": value,      # This becomes the Field Value
        "time_stamp": int(time.time()) # Common timestamp
    }
    
    # 2. Define the Topic (sensors / kind / id)
    topic = f"sensors/{kind}/{sensor_id}"
    
    # 3. Publish
    client.publish(topic, json.dumps(payload))
    print(f" -> Sent: {topic}")

def run_simulation():
    client = get_mqtt_client()
    if not client: return

    print("Simulation started... (Ctrl+C to stop)")
    
    # Define a "Physical Device" ID
    weather_station_id = "ws_outdoor_01"

    try:
        while True:
            # --- Device 1: Weather Station (Produces 2 values) ---
            
            # Generate values
            sim_temp = round(random.uniform(20.0, 35.0), 1)
            sim_hum = round(random.uniform(40.0, 90.0), 1)

            print(f"\n[Device: {weather_station_id}] Reading sensors...")

            # OUTPUT 1: Temperature Queue
            publish_reading(client, weather_station_id, "temperature", sim_temp, "C")

            # OUTPUT 2: Humidity Queue
            publish_reading(client, weather_station_id, "humidity", sim_hum, "%")

            time.sleep(5)

    except KeyboardInterrupt:
        print("\nStopping...")
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    run_simulation()