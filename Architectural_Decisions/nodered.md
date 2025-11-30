## Decisions 

### Decision 1: Single MQTT Input vs. Multiple Inputs

**Context:** We need to log all sensor data to InfluxDB but trigger alerts only for specific sensor kinds.

| Feature | **Option A: Single Input (Selected)** | **Option B: Multiple Inputs** |
| :--- | :--- | :--- |
| **Topic Strategy** | `sensors/#` | `sensors/distance/#`, `sensors/flow/#` |
| **Database Logging** | **Automatic.** One trunk wire logs everything. | **Manual.** Requires wiring every new input to DB. |
| **Scalability** | **High.** New sensor types (e.g., Temp) are logged instantly. | **Low.** Must edit flow to add new types. |
| **Performance** | Minimal overhead. | Slightly optimized (filters at broker). |

**Decision:** We chose **Option A** to prioritize data integrity (logging everything) and simplified maintenance.

### Decision 2: Database Selection (General Purpose vs. Time Series)

**Context:** We are collecting continuous streams of sensor data. The data structure is always `Timestamp + Metadata (Tags) + Value`. We initially considered standard relational (PostgreSQL) or document (MongoDB) databases but were advised to look into specialized solutions.

| Feature | **Option A: InfluxDB (Selected)** | **Option B: PostgreSQL (SQL)** | **Option C: MongoDB (NoSQL)** |
| :--- | :--- | :--- | :--- |
| **Primary Use Case** | **Time Series Data.** Optimized for timestamped streams. | **Relational Data.** Good for complex relationships (User <-> Orders). | **Document Data.** Good for flexible, unstructured objects. |
| **Write Performance** | **High.** Designed to ingest millions of data points per second. | **Medium.** Transaction overhead (ACID) slows down massive concurrent writes. | **High.** Very fast, but storage footprint can grow large quickly. |
| **Data Retention** | **Native.** "Retention Policies" auto-delete data older than X days. | **Manual.** Requires custom cron jobs or scripts to delete old rows. | **Manual.** Requires "TTL Indexes" or custom scripts. |
| **Query Logic** | **Time-First.** "Get average flow rate every 10 mins" is a native command. | **Table-First.** Requires complex Group By / Window functions. | **Document-First.** Requires complex Aggregation Pipelines. |

#### **The Verdict: Option A (InfluxDB)**
**Why?**
1.  **Time-Based Optimization:** IoT data is useless without the context of *when* it happened. InfluxDB indexes everything by time automatically, making queries like "Show me the last hour" instant.
2.  **Automatic Cleanup:** We do not want to fill the hard drive with sensor data from 5 years ago. InfluxDB allows us to set a policy (e.g., `KEEP 30 DAYS`) and it handles the deletion automatically.
3.  **Downsampling:** We can easily configure tasks to convert high-frequency data (1 reading/sec) into low-frequency historical data (1 average/hour) to save space.
   
### Decision 3: Data Ingestion Strategy (Coupled vs. Decoupled)

**Context:** We need a reliable way to move data from the MQTT Broker into InfluxDB. We considered using a dedicated ingestion agent versus handling the ingestion directly within our logic engine (Node-RED).

| Feature | **Option A: Node-RED (Selected)** | **Option B: Dedicated engine** |
| :--- | :--- | :--- |
| **Architecture** | **Coupled.** Logic and Logging happen in the same process. | **Decoupled.** Logging happens independently of business logic. |
| **Setup Complexity** | **Low.** Drag-and-drop nodes within the existing flow. | **Medium.** Requires installing a separate service and managing configuration files. |
| **Data Transformation** | **Flexible.** We can easily modify/clean data (Javascript) before saving. | **Rigid.** Mostly strict "input -> output" with limited transformation capabilities. |
| **Reliability** | **Dependent.** If Node-RED crashes due to a logic error, logging stops. | **High.** If Node-RED crashes, Dedicated engine keeps recording data to the DB. |

#### **The Verdict: Option A (Node-RED)**
**Why?**
1.  **Rapid Prototyping:** Since we are currently simulating and defining our data model, having the database ingestion inside Node-RED allows us to visually debug the data flow immediately.
2.  **Simplified Stack:** It reduces the number of services we need to manage. We do not need to implement and configure an agent right now.
3.  **Logic-First:** We may want to filter out "bad" sensor readings (e.g., error codes or outliers) *before* they pollute the database. Node-RED makes this pre-processing trivial.
    * *Note: As the project scales to hundreds of sensors, we may migrate the "Logging" responsibility to a dedicated agent to ensure data integrity.*