import sys
import time
import json
import random
import paho.mqtt.client as mqtt

# --- Configuration ---
BROKER = "192.168.3.35"
PORT = 1883
USERNAME = "kalo"
PASSWORD = "kalo"

# Recommended: False, so you can filter by kind/id in the topic
USE_SINGLE_TOPIC = False

SENSOR_ID = "c19ceefb-b235-4207-a8eb-b47930c99f5f"
SENSOR_KIND = "rain_gauge"
SENSOR_UNITS = "mm"

LOOP_SLEEP_TIME = 0.5
SIMULATION_INTERVAL = 30

SEASONS = ["spring", "summer", "fall", "winter"]
# Profile Logic:
# start_prob: Chance to start raining if currently DRY
# stop_prob: Chance to stop raining if currently WET
# intensity_min/max: mm/minute
SEASON_PROFILES = {
    # Summer: Hard to start (5%), but if it starts, it rains HARD and stops somewhat fast (20%)
    "summer": {
        "start_prob": 0.05,
        "stop_prob": 0.20,
        "min_rate": 5.0,
        "max_rate": 20.0,
    },
    # Winter: Easy to start (20%), stops rarely (5%), but intensity is low (drizzle)
    "winter": {"start_prob": 0.20, "stop_prob": 0.05, "min_rate": 0.2, "max_rate": 2.0},
    # Spring: Balanced
    "spring": {"start_prob": 0.10, "stop_prob": 0.10, "min_rate": 0.5, "max_rate": 5.0},
    # Fall: Starts easily, stays a long time, medium intensity
    "fall": {"start_prob": 0.15, "stop_prob": 0.05, "min_rate": 1.0, "max_rate": 8.0},
    "default": {
        "start_prob": 0.10,
        "stop_prob": 0.10,
        "min_rate": 1.0,
        "max_rate": 5.0,
    },
}


# --- MQTT Setup ---
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"Connected to MQTT Broker at {BROKER}")
    else:
        print(f"Failed to connect, return code {rc}")


class RainSimulator:
    def __init__(self, season):
        self.season = season
        self.profile = SEASON_PROFILES.get(season, SEASON_PROFILES["default"])
        self.is_raining = False
        self.current_rate = 0.0  # mm per minute

    def next_value(self, virtual_elapsed_seconds):
        """
        Calculates accumulated rain based on state.
        """

        # 1. State Machine (Markov Chain)
        if self.is_raining:
            # If it's already raining, check if it stops
            if random.random() < self.profile["stop_prob"]:
                self.is_raining = False
                self.current_rate = 0.0
                print("--- Rain Stopped ---")
            else:
                # OPTIONAL: Let intensity drift slightly while raining
                # Fluctuate by +/- 10%
                drift = random.uniform(0.9, 1.1)
                self.current_rate *= drift
                # Clamp to limits
                self.current_rate = max(
                    self.profile["min_rate"],
                    min(self.current_rate, self.profile["max_rate"]),
                )

        else:
            # If it's dry, check if it starts
            if random.random() < self.profile["start_prob"]:
                self.is_raining = True
                # Pick an initial random intensity
                self.current_rate = random.uniform(
                    self.profile["min_rate"], self.profile["max_rate"]
                )
                print(f"--- Rain Started (Rate: {self.current_rate:.2f} mm/min) ---")

        # 2. Calculate Accumulation
        # If not raining, accumulation is 0
        if not self.is_raining:
            return 0.0

        # Math: Rate (mm/min) * Time (minutes)
        minutes_passed = virtual_elapsed_seconds / 60.0
        accumulated_mm = self.current_rate * minutes_passed

        return round(accumulated_mm, 2)


def main(season):
    client = mqtt.Client()
    client.username_pw_set(USERNAME, PASSWORD)
    client.on_connect = on_connect

    try:
        client.connect(BROKER, PORT, 60)
        client.loop_start()

        sim = RainSimulator(season)
        print(f"Simulation: {season.upper()}")
        print(f"Real Loop Speed: {LOOP_SLEEP_TIME}s")
        print(f"Virtual Interval: {SIMULATION_INTERVAL}s (This value is used for math)")
        print("-" * 30)
        print("Press Ctrl+C to stop.\n")

        while True:
            rain_accumulated = sim.next_value(SIMULATION_INTERVAL)

            payload = {
                "id": SENSOR_ID,
                "kind": SENSOR_KIND,
                "units": SENSOR_UNITS,
                "data": rain_accumulated,
                "time_stamp": int(time.time()),
            }

            json_payload = json.dumps(payload)

            if USE_SINGLE_TOPIC:
                topic = "sensors"
            else:
                topic = f"sensors/{SENSOR_KIND}/{SENSOR_ID}"

            # Only print if there is rain, or occasionally print 0 to show it's alive
            if rain_accumulated > 0:
                print(f"[WET] {payload['data']} - at time {payload['time_stamp']}")
            else:
                # Optional: lessen noise in console
                print(f"[DRY] {payload['data']} - at time {payload['time_stamp']}")

            # print(f"Published to [{topic}]: {json_payload}")
            client.publish(topic, json_payload)

            time.sleep(LOOP_SLEEP_TIME)

    except KeyboardInterrupt:
        print("\nSimulation stopped.")
        client.loop_stop()
        client.disconnect()


if __name__ == "__main__":
    target_season = "default"
    if len(sys.argv) == 2:
        if sys.argv[1] in SEASONS:
            target_season = sys.argv[1]
        else:
            print(f"Invalid season. Using default. Options: {', '.join(SEASONS)}")

    main(target_season)
