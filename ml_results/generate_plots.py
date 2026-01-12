"""Generate evaluation metrics and diagnostic plots from predictions.csv

Expected input: ml_results/predictions.csv with columns:
  - datetime (optional)
  - y_true
  - y_pred
  - model (optional)

Outputs:
    - ml_results/metrics_table.csv
    - ml_results/metrics_table.tex
    - report/figures/pred_vs_actual.png
    - report/figures/residuals_hist.png
    - report/figures/ts_overlay.png (if datetime present)
    - report/figures/feature_importances.png (if ml_results/feature_importances.csv present)

Usage:
    python ml_results/generate_plots.py --input ml_results/predictions.csv
"""
from __future__ import annotations
import argparse
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import mean_absolute_error, r2_score

# Use root_mean_squared_error if available (scikit-learn >=1.4)
try:
        from sklearn.metrics import root_mean_squared_error
        HAS_RMSE = True
except ImportError:
        from sklearn.metrics import mean_squared_error
        HAS_RMSE = False

sns.set_theme(style="whitegrid")

ROOT = Path(__file__).resolve().parent.parent
ML_RESULTS = ROOT / "ml_results"
FIG_DIR = ROOT / "report" / "figures"
ML_RESULTS.mkdir(parents=True, exist_ok=True)
FIG_DIR.mkdir(parents=True, exist_ok=True)


def mape(y_true, y_pred):
        y_true = np.array(y_true)
        y_pred = np.array(y_pred)
        denom = np.where(np.abs(y_true) < 1e-9, 1e-9, np.abs(y_true))
        return np.mean(np.abs((y_true - y_pred) / denom)) * 100.0


def compute_metrics(df: pd.DataFrame) -> pd.DataFrame:
        rows = []
        if 'model' in df.columns:
                groups = df.groupby('model')
        else:
                groups = [("model", df)]

        for name, g in groups:
                y_true = g['y_true'].values
                y_pred = g['y_pred'].values
                mae = mean_absolute_error(y_true, y_pred)
                if HAS_RMSE:
                        rmse = root_mean_squared_error(y_true, y_pred)
                else:
                        rmse = mean_squared_error(y_true, y_pred, squared=False)
                mape_v = mape(y_true, y_pred)
                r2 = r2_score(y_true, y_pred)
                rows.append({
                        'model': name,
                        'MAE': mae,
                        'RMSE': rmse,
                        'MAPE_pct': mape_v,
                        'R2': r2
                })
        return pd.DataFrame(rows)


def plot_pred_vs_actual(df: pd.DataFrame, outpath: Path):
        plt.figure(figsize=(6,6))
        sns.scatterplot(x='y_true', y='y_pred', data=df, alpha=0.6)
        low = min(df['y_true'].min(), df['y_pred'].min())
        high = max(df['y_true'].max(), df['y_pred'].max())
        plt.plot([low, high], [low, high], 'k--', linewidth=1)
        plt.xlabel('Observed')
        plt.ylabel('Predicted')
        plt.title('Predicted vs Observed')
        plt.tight_layout()
        plt.savefig(outpath, dpi=150)
        plt.close()


def plot_residuals_hist(df: pd.DataFrame, outpath: Path):
        res = df['y_true'] - df['y_pred']
        plt.figure(figsize=(6,4))
        sns.histplot(res, kde=True, bins=30)
        plt.xlabel('Residual (Observed - Predicted)')
        plt.title('Residual Distribution')
        plt.tight_layout()
        plt.savefig(outpath, dpi=150)
        plt.close()


def plot_ts_overlay(df: pd.DataFrame, outpath: Path):
        if 'datetime' not in df.columns:
                return False
        d = df.copy()
        d['datetime'] = pd.to_datetime(d['datetime'])
        d = d.sort_values('datetime')
        plt.figure(figsize=(10,4))
        plt.plot(d['datetime'], d['y_true'], label='Observed', linewidth=1)
        plt.plot(d['datetime'], d['y_pred'], label='Predicted', linewidth=1, alpha=0.8)
        plt.legend()
        plt.xlabel('Datetime')
        plt.ylabel('Value')
        plt.title('Time series: Observed vs Predicted')
        plt.tight_layout()
        plt.savefig(outpath, dpi=150)
        plt.close()
        return True


def plot_feature_importances(fi_path: Path, outpath: Path):
        if not fi_path.exists():
                return False
        try:
                fi = pd.read_csv(fi_path)
                if 'feature' in fi.columns and ('importance' in fi.columns or 'importance_mean' in fi.columns):
                        imp_col = 'importance' if 'importance' in fi.columns else 'importance_mean'
                        fi = fi.sort_values(imp_col, ascending=False).head(30)
                        plt.figure(figsize=(6, max(3, 0.25 * len(fi))))
                        sns.barplot(x=imp_col, y='feature', data=fi)
                        plt.title('Feature importances')
                        plt.tight_layout()
                        plt.savefig(outpath, dpi=150)
                        plt.close()
                        return True
        except Exception as e:
                print(f"[WARN] Could not plot feature importances: {e}")
        return False


def export_latex_table(metrics_df: pd.DataFrame, outpath: Path):
        try:
                latex = metrics_df.to_latex(index=False, float_format="%.3f")
                outpath.write_text(latex)
                return True
        except Exception as e:
                print(f"[WARN] Failed to write LaTeX table: {e}")
                return False


def main():
        parser = argparse.ArgumentParser()
        parser.add_argument('--input', '-i', type=str, default=str(ML_RESULTS / 'predictions.csv'))
        parser.add_argument('--out-metrics', type=str, default=str(ML_RESULTS / 'metrics_table.csv'))
        args = parser.parse_args()

        input_path = Path(args.input)
        if not input_path.exists():
                print(f"[ERROR] Input file not found: {input_path}")
                return

        df = pd.read_csv(input_path)
        required = {'y_true', 'y_pred'}
        if not required.issubset(set(df.columns)):
                print(f"[ERROR] Input CSV must contain columns: {required}")
                return

        metrics_df = compute_metrics(df)
        metrics_out = Path(args.out_metrics)
        metrics_df.to_csv(metrics_out, index=False)
        print(f"[OK] Metrics written to {metrics_out}")

        # LaTeX table
        tex_out = metrics_out.with_suffix('.tex')
        if export_latex_table(metrics_df, tex_out):
                print(f"[OK] LaTeX table written to {tex_out}")

        # Save predictions with residuals
        df['residual'] = df['y_true'] - df['y_pred']
        df.to_csv(ML_RESULTS / 'predictions_with_residuals.csv', index=False)

        # Plots
        plot_pred_vs_actual(df, FIG_DIR / 'pred_vs_actual.png')
        print(f"[OK] pred_vs_actual.png saved")
        plot_residuals_hist(df, FIG_DIR / 'residuals_hist.png')
        print(f"[OK] residuals_hist.png saved")
        if plot_ts_overlay(df, FIG_DIR / 'ts_overlay.png'):
                print(f"[OK] ts_overlay.png saved")
        else:
                print(f"[INFO] datetime column not found; skipping ts_overlay")

        # Feature importances (optional)
        fi_path = ML_RESULTS / 'feature_importances.csv'
        if plot_feature_importances(fi_path, FIG_DIR / 'feature_importances.png'):
                print(f"[OK] feature_importances.png saved")
        else:
                print(f"[INFO] feature_importances.csv not found or invalid; skipped feature importances")

        print("[DONE] All artifacts generated.")


if __name__ == '__main__':
        main()
