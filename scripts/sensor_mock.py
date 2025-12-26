# this script simulates two sensor one output for each and sends data to an MQTT broker

import time
import json
import random
import paho.mqtt.client as mqtt

# --- Configuration ---
BROKER = "localhost"
PORT = 1883
USERNAME = "kalo"
PASSWORD = "kalo"

# Recommended: False, so you can filter by kind/id in the topic
USE_SINGLE_TOPIC = False

# --- Sensor Definitions ---
simulated_sensors = [
    {
        "id": "e5f24cae-e8dd-4770-8306-fd28837aa89a",
        "kind": "flow_rate",
        "units": "L/hour",
        "min": 100.0,
        "max": 500.0,
        "time_stamp": 1764501821,
    },
    {
        # Distance Sensor 1
        "id": "3ade6e09-3365-45a2-abca-1a01611ab078",
        "kind": "distance",
        "units": "cm",
        "min": 10,
        "max": 1000.0,
        "time_stamp": 1764501821,
    },
    {
        # Distance Sensor 2 (To show how we handle same 'kind', different ID)
        "id": "99999999-aaaa-bbbb-cccc-dddddddddddd",
        "kind": "distance",
        "units": "cm",
        "min": 10,
        "max": 1000.0,
        "time_stamp": 1764501821,
    },
]


# --- MQTT Setup ---
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"Connected to MQTT Broker at {BROKER}")
    else:
        print(f"Failed to connect, return code {rc}")


client = mqtt.Client()
client.username_pw_set(USERNAME, PASSWORD)
client.on_connect = on_connect

try:
    client.connect(BROKER, PORT, 60)
    client.loop_start()

    print("Starting simulation... Press Ctrl+C to stop.")

    while True:
        for sensor in simulated_sensors:
            current_val = round(random.uniform(sensor["min"], sensor["max"]), 2)

            # Updated Payload with 'kind'
            payload = {
                "id": sensor["id"],
                "kind": sensor["kind"],
                "units": sensor["units"],
                "data": current_val,
                "time_stamp": int(time.time()),
            }

            json_payload = json.dumps(payload)

            # Topic Structure: sensors / [kind] / [id]
            if USE_SINGLE_TOPIC:
                topic = "sensors"
            else:
                topic = f"sensors/{sensor['kind']}/{sensor['id']}"

            client.publish(topic, json_payload)
            print(f"Published to [{topic}]: {json_payload}")

        time.sleep(2)

except KeyboardInterrupt:
    print("\nSimulation stopped.")
    client.loop_stop()
    client.disconnect()
