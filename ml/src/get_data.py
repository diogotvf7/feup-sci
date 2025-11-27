import argparse
import datetime as dt
import json
import os
from pathlib import Path
from typing import Any, Dict, Optional
from dotenv import load_dotenv
import requests

coords = [41.6513969, -8.2336394]

# https://openweathermap.org/api/one-call-3#history_daily_aggregation
"""
If the service detected timezone for your location incorrectly you can specify correct timezone manually by adding tz parameter in the ±XX:XX format to API call.

API call
https://api.openweathermap.org/data/3.0/onecall/day_summary?lat={lat}&lon={lon}&date={date}&tz={tz}&appid={API key}

https://api.openweathermap.org/data/3.0/onecall/day_summary?lat={lat}&lon={lon}&date={date}&appid={API key}
"""

API_URL = "https://api.openweathermap.org/data/3.0/onecall/day_summary"
DATA_FILE = Path(__file__).with_name("openweather_day_summary.json")


def _load_cache() -> Dict[str, Any]:
    if not DATA_FILE.exists():
        return {}
    with DATA_FILE.open("r", encoding="utf-8") as handle:
        try:
            cached = json.load(handle)
        except json.JSONDecodeError:
            return {}
    return cached if isinstance(cached, dict) else {}


def _save_cache(cache: Dict[str, Any]) -> None:
    with DATA_FILE.open("w", encoding="utf-8") as handle:
        json.dump(cache, handle, ensure_ascii=True, indent=2, sort_keys=True)


def _fetch_day_summary(
    target_date: dt.date,
    api_key: str,
    tz: Optional[str],
    session: requests.Session,
) -> Dict[str, Any]:
    params = {
        "lat": coords[0],
        "lon": coords[1],
        "date": target_date.isoformat(),
        "appid": api_key,
    }
    if tz:
        params["tz"] = tz
    response = session.get(API_URL, params=params, timeout=30)
    response.raise_for_status()
    return response.json()


def update_day_summary(
    year: Optional[int] = None,
    days_before: int = 0,
    tz: Optional[str] = None,
) -> Dict[str, Any]:
    today = dt.date.today()
    target_year = year or today.year
    days_before = max(0, days_before)

    start_date = dt.date(target_year, 1, 1) - dt.timedelta(days=days_before)
    end_date = dt.date(target_year, 12, 31)
    if target_year == today.year:
        end_date = today
    if start_date > end_date:
        raise ValueError("Computed date range is empty.")

    cache = _load_cache()
    pending_dates = []
    current = start_date
    one_day = dt.timedelta(days=1)
    while current <= end_date:
        key = current.isoformat()
        if key not in cache:
            pending_dates.append(current)
        current += one_day

    if not pending_dates:
        return cache

    api_key = os.environ.get("OPENWEATHER_API_KEY")
    if not api_key:
        raise RuntimeError("OPENWEATHER_API_KEY environment variable is required.")

    with requests.Session() as session:
        for target_date in pending_dates:
            cache[target_date.isoformat()] = _fetch_day_summary(
                target_date=target_date,
                api_key=api_key,
                tz=tz,
                session=session,
            )

    _save_cache(cache)
    return cache

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Fetch and cache OpenWeather day summary data."
    )
    parser.add_argument(
        "--year",
        type=int,
        default=dt.date.today().year,
        help="Year to fetch (defaults to current year).",
    )
    parser.add_argument(
        "--days-before",
        type=int,
        default=int(os.environ.get("OPENWEATHER_DAYS_BEFORE", "0")),
        help="Additional number of days before Jan 1 of the selected year to fetch.",
    )
    parser.add_argument(
        "--tz",
        type=str,
        default=os.environ.get("OPENWEATHER_TZ"),
        help="Timezone override in ±HH:MM format.",
    )
    args = parser.parse_args()

    cache = update_day_summary(
        year=args.year,
        days_before=args.days_before,
        tz=args.tz,
    )
    print(f"Cached day summaries: {len(cache)} records.")


if __name__ == "__main__":
    load_dotenv()
    main()
