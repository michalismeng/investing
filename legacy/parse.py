## Format of filenames
## {Min Market Cap in Millions}-{Day}-{Month}-{Year of query}.html

import sys
import pandas as pd
import matplotlib.pyplot as plt
import yfinance as yf


if len(sys.argv) < 2:
    raise Exception("Please provider filename argument")

filename = sys.argv[1]

dfs = pd.read_html(filename)
assert len(dfs) == 1
df = dfs[0]

for ticker in df["Ticker"][:2]:
    print("Printing market cap for %s" % ticker)
    t = yf.Ticker(ticker)
    print("Market cap from yfinance: %s" % (t.info["marketCap"] / 1000000))
    print(("Market cap from magic formula: %s" % 
           int(df[df["Ticker"] == ticker]["Market Cap ($ Millions)"])))
# print(df)
