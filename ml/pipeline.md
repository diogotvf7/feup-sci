# Project Roadmap: Advanced Modelling & CPS Integration Strategy

## 1. Context & Challenge
Our current baseline analysis reveals a common characteristic of Cyber-Physical Systems (CPS) with high physical inertia: the state of the system today (water level) is the strongest predictor for tomorrow ($R^2 > 0.95$).

While our initial Random Forest model performs well globally, it struggles to differentiate itself from a naive "persistence baseline" during stable periods. However, the value of an **Intelligent Dam System** lies not in predicting stability, but in predicting **changes and critical events** (heavy rainfall response, overflow risks).

To elevate the project to a state-of-the-art (SOTA) level, we are proposing a shift in architecture and modelling techniques.

## 2. Proposed Architectural Improvements

### A. Physics-Informed Target: "Delta" Learning
Instead of predicting the absolute water volume ($V_{t+1}$), which is highly autocorrelated, we will train models to predict the **Rate of Change** ($\Delta V$).

* **Current Approach:** $f(Rain, CurrentVol) \rightarrow V_{t+1}$ (Model is lazy, relies on CurrentVol).
* **New Approach:** $f(Rain, SoilSaturation) \rightarrow \Delta V$
* **Reconstruction:** $V_{t+1} = V_t + \text{PredictedDelta}$

**Why this is better:** This forces the ML model to learn the *physical cause-and-effect* relationship between weather inputs (inflow) and volume change, rather than just memorizing the previous state.

### B. State-of-the-Art Model Selection
We will benchmark two advanced architectures against our Random Forest baseline:

1.  **XGBoost (Gradient Boosting Trees):**
    * **Role:** The current industry standard for tabular time-series data.
    * **Advantage:** Handles non-linear relationships and "residuals" (errors) better than Random Forests. It is particularly effective at capturing sudden spikes caused by weather events.

2.  **LSTM (Long Short-Term Memory - Deep Learning):**
    * **Role:** A Recurrent Neural Network (RNN) designed for sequence modelling.
    * **Advantage:** Unlike tree-based models, LSTM maintains an internal "memory" state, allowing it to understand long-term dependencies (e.g., how rain 7 days ago affects soil saturation and inflow today).

## 3. Safety-Critical Evaluation Metrics
In a CPS context, Mean Absolute Error (MAE) is insufficient because it averages out critical failures. We will introduce **Risk-Oriented Evaluation**:

* **Risk Classes:**
    * 🔴 **Dry Risk:** $< 20\%$ capacity
    * 🟢 **Normal Operation:** $20\% - 90\%$ capacity
    * 🔴 **Overflow Risk:** $> 90\%$ capacity
* **Metric:** We will compute a **Confusion Matrix** for these classes. The goal is to minimize *False Negatives* on Overflow Risk (predicting "Normal" when "Overflow" is imminent).
* **Event-Based MAE:** Calculating error *only* on days where precipitation $> 10mm$ or volume change $> 1\%$, to prove the model outperforms the baseline when it actually matters.

## 4. Implementation Roadmap

### Phase 1: Advanced Feature Engineering (Immediate)
- [ ] Implement **Delta Target** ($\Delta V$) transformation.
- [ ] Add **Cumulative Rainfall** features (15-day / 30-day sums) to proxy soil saturation.
- [ ] Create `rate_of_change` features for the dam inflow.

### Phase 2: Model Training & Comparison (This Week)
- [ ] Train **XGBoost Regressor** on Delta targets.
- [ ] Implement a basic **LSTM (Keras/TensorFlow)** for academic comparison.
- [ ] Generate comparative plots: *Baseline vs. RF vs. XGBoost vs. LSTM*.

### Phase 3: CPS Integration Logic (Next Step)
- [ ] Define the control logic rules (e.g., *IF predicted_risk == High THEN trigger_alert*).
- [ ] Prepare the "Virtual Sensor" architecture diagram (where ML acts as a software sensor feeding a Node-RED dashboard).

---
*This roadmap ensures our project moves beyond basic data analysis into a robust, safety-aware Cyber-Physical System.*