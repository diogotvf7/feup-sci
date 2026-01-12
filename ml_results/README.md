Use `generate_plots.py` to produce evaluation metrics and figures from `predictions.csv`.

Expected input: `ml_results/predictions.csv` with columns: `datetime` (optional), `y_true`, `y_pred`, `model` (optional).

Run:

```bash
pip install pandas numpy scikit-learn matplotlib seaborn
python ml_results/generate_plots.py --input ml_results/predictions.csv
```

Outputs are written to `ml_results/metrics_table.csv`, `ml_results/metrics_table.tex` and `report/figures/`.