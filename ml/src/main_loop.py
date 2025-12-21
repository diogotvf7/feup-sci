import time
import subprocess
import sys
import os
from datetime import datetime

PYTHON_EXEC = sys.executable 
SCRIPT_PATH = os.path.join(os.path.dirname(__file__), "dam_predictor.py")

def main():
    print(f"[AUTO] Starting ML Prediction Loop...")
    print(f"[AUTO] Interpreter: {PYTHON_EXEC}")
    print(f"[AUTO] Target Script: {SCRIPT_PATH}")
    print(f"[AUTO] Interval: 60 seconds")
    print("-" * 50)

    try:
        while True:
            start_time = time.time()
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"\n[{timestamp}] Running prediction cycle...")

            try:
                # Run the predictor script as a separate process
                # This ensures memory is cleared after each run and isolates crashes
                result = subprocess.run(
                    [PYTHON_EXEC, SCRIPT_PATH],
                    check=True,
                    timeout=30, # Max duration for one run
                    capture_output=True,
                    text=True
                )
                
                # Print output for debugging (optional, can be verbose)
                print(f"[OUTPUT] {result.stdout}")
                
                if result.stderr:
                    print(f"[STDERR] {result.stderr}")

            except subprocess.CalledProcessError as e:
                print(f"[ERROR] Script crashed with exit code {e.returncode}")
                print(f"[STDERR] {e.stderr}")
                print(f"[STDOUT] {e.stdout}")
            except subprocess.TimeoutExpired:
                print(f"[ERROR] Script timed out!")
            except Exception as e:
                print(f"[ERROR] Unknown Execution Error: {e}")

            # Sleep for the remainder of the minute
            elapsed = time.time() - start_time
            sleep_time = max(0, 60 - elapsed)
            print(f"[AUTO] Cycle complete. Sleeping for {sleep_time:.2f}s...")
            time.sleep(sleep_time)

    except KeyboardInterrupt:
        print("\n[AUTO] Stopping loop. Goodbye!")

if __name__ == "__main__":
    main()
