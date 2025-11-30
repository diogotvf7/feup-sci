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