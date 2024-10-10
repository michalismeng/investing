from ftplib import FTP
from functools import partial
from io import StringIO
from multiprocessing import Pool, cpu_count
import re
import yfinance as yf
import pandas as pd
import os
import sys
from pathlib import Path


def get_tickers_from_nasdaq():
    filename = "nasdaqtraded.txt"
    ticker_column = 1
    etf_column = 5
    exchange_column = 3
    test_column = 7
    ftp = FTP("ftp.nasdaqtrader.com")
    ftp.login()
    ftp.cwd("SymbolDirectory")
    lines = StringIO()
    ftp.retrlines("RETR " + filename, lambda x: lines.write(str(x) + "\n"))
    ftp.quit()
    lines.seek(0)
    results = lines.readlines()
    tickers = []

    for entry in results:
        sec = {}
        values = entry.split("|")
        ticker = values[ticker_column]
        if (
            re.match(r"^[A-Z]+$", ticker)
            and values[etf_column] == "N"
            and values[test_column] == "N"
        ):
            tickers.append(ticker)

    # There are reference tickers, ETFs
    if "SPY" not in tickers:
        tickers.append("SPY")

    if "QQQ" not in tickers:
        tickers.append("QQQ")

    return tickers


def escape_ticker(ticker):
    return ticker.replace(".", "-")


def get_yf_data(ticker, period):
    escaped_ticker = escape_ticker(ticker)
    df = yf.download(escaped_ticker, period=period, auto_adjust=False, interval="1d", actions=True, progress=False)
    df["Ticker"] = ticker
    return df


def main():
    period = os.getenv("PERIOD")
    file = os.getenv("FILE", None)
    tickers = os.getenv("TICKERS", None)

    if os.path.exists(file):
        return

    if not period:
        raise Exception("PERIOD environment variable must be set before calling this script.")

    if not tickers:
        tickers = get_tickers_from_nasdaq()
    else:
        tickers = tickers.split(",")

    if tickers:
        pool = Pool(cpu_count())
        download_func = partial(get_yf_data, period=period)
        print(f"Downloading {period} data for {len(tickers)} symbols using {cpu_count()} threads...")
        results = pool.map(download_func, tickers)
        pool.close()
        pool.join()

        df = pd.concat(list(filter(lambda x: len(x) > 0, results)))
        df.to_csv(file) if file else df.to_csv(sys.stdout)


if __name__ == "__main__":
    main()

