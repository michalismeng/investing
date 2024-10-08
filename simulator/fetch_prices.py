import yfinance as yf
import pandas as pd
import os
import sys
from pathlib import Path
from datetime import datetime

def escape_ticker(ticker):
    return ticker.replace(".", "-")

def get_yf_data(ticker, period):
    escaped_ticker = escape_ticker(ticker)
    return yf.download(escaped_ticker, period=period, auto_adjust=True, progress=False, interval="1d", actions=True)

def main():
    ticker = os.getenv("TICKER")
    period = os.getenv("PERIOD")

    if not ticker or not period:
        raise Exception("TICKER and PERIOD environment variables must be set before calling this script.")

    folder = os.getenv("FOLDER", None)
    df = get_yf_data(ticker, period)
    if len(df) == 0:
        exit(1)
    if folder:
        output_dir = os.path.join(folder, datetime.today().strftime("%Y-%m-%d"))
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        output_file = os.path.join(output_dir, ticker) + ".csv"
        df.to_csv(output_file)
        print(output_file)
    else:
        df.to_csv(sys.stdout)


if __name__ == "__main__":
    main()

