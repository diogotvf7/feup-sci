 # Data & Ingestion Strategy

 ## 1. The Core Philosophy: "Atomic Messaging"
 We have adopted a **decoupled architecture**. Even if a physical device (like a Weather Station) measures multiple things (Temp + Humidity), it will **not** send a complex bundled message.

 Instead, it acts like two separate sensors, sending **two separate MQTT messages** to **two separate topics**.

 * **Pro:** Node-RED stays generic (doesn't need to know which sensors exist).
 * **Pro:** InfluxDB stays clean (specific measurements for specific data).
 * **Pro:** Scalability (adding a new sensor type requires 0 changes to the backend).

Creating a complex bundled message was considred but would increase complexity unecessarlly and this only costed a bit of overhead to the broker.

 ---

 ## 2. The Data Contract (JSON Payload)
 Every sensor, regardless of type, must strictly follow this JSON structure.

 ### The Keys:
 * **id** `(String)`: The unique UUID of the physical hardware.
 * **kind** `(String)`: The type of measurement (e.g., `temperature`, `flow_rate`).         
   * **Crucial:** This becomes the Database Table Name.
 * **units** `(String)`: The unit of measurement (e.g., `C`, `L/h`). This is saved as a Tag.
 * **data** `(Number)`: The actual sensor reading. This is saved as the Field Value.
 * **time_stamp** `(Integer)`: Unix timestamp (seconds) of when the reading happened.

With the possibilty to add new fields and just need to add them to the formatter on the node-red flow.

 ---

 ## 3. Example Implementation

 ### Scenario: A Weather Station measures 24.5°C and 60% Humidity.

 #### Message A (Temperature)
 * **Topic:** `sensors/temperature/ws_01`
 * **Payload:**
 ```json
 {
   "id": "cf919824-2fd2-4e22-a0c2-6c335a88f2e2",
   "kind": "temperature",
   "units": "C",
   "data": 24.5,
   "time_stamp": 1764508000
 }
 ```

 #### Message B (Humidity)
 * **Topic:** `sensors/humidity/ws_01`
 * **Payload:**
 ```json
 {
   "id": "cf919824-2fd2-4e22-a0c2-6c335a88f2e2",
   "kind": "humidity",
   "units": "%",
   "data": 60.0,
   "time_stamp": 1764508000
 }
 ```

 ---

 ## 4. InfluxDB Mapping
 How Node-RED translates the JSON above into the Database.

 ### 4.1 Temperature 

 | JSON Key | InfluxDB Concept | Example Value | Function |
 | :--- | :--- | :--- | :--- |
 | `kind` | **Measurement** | `temperature` | Acts as the "Table" name. |
 | `id` | **Tag** | `cf919824-2fd2-4e22-a0c2-6c335a88f2e2` | Indexed metadata for fast filtering. |
 | `units` | **Tag** | `C` | Indexed metadata to differentiate units. |
 | `data` | **Field (`value`)** | `24.5` | The raw number used for graphing. |
 | `time_stamp`| **Index Time (`_time`)** | `2025-11-30T13:06:40.000Z` | The X-Axis on the graph. |

 ### 4.2 Humidity 
 | JSON Key | InfluxDB Concept | Example Value | Function |
 | :--- | :--- | :--- | :--- |
 | `kind` | **Measurement** | `humidity` | Acts as the "Table" name. |
 | `id` | **Tag** | `cf919824-2fd2-4e22-a0c2-6c335a88f2e2` | Indexed metadata for fast filtering. |
 | `units` | **Tag** | `%` | Indexed metadata to differentiate units. |
 | `data` | **Field (`value`)** | `60.0` | The raw number used for graphing. |
 | `time_stamp`| **Index Time (`_time`)** | `2025-11-30T13:06:40.000Z` | The X-Axis on the graph. |