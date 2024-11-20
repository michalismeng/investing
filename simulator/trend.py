import numpy as np
from sqlalchemy import create_engine
import pandas as pd

db_connection_str = 'mysql+pymysql://root:Mixalis97%40%40@localhost/InvestingSimulator'
db_connection = create_engine(db_connection_str)

INDUSTRIES = [
    "Banks%%Regional",
    "Capital Markets",
    "Insurance%%Diversified",
    "Insurance%%Life",
    "%%Independent Power Producers",
]
INDUSTRY = INDUSTRIES[4]

print(f"Calculating stage 2 companies for industry: {INDUSTRY}")
interest = pd.read_sql('SELECT * FROM Tickers WHERE Industry LIKE "%s"' % INDUSTRY, con=db_connection)

print(interest.reset_index())

prices = pd.read_sql('SELECT * FROM PriceData WHERE Ticker in (%s) AND Date >= "2023-01-01" ORDER BY Date' % ",".join(map(lambda x: f'"{x}"', interest["Ticker"].tolist())), con=db_connection)

result = []

for ticker in interest["Ticker"].tolist():
    price = prices[prices["Ticker"] == ticker].reset_index()
    if not len(price):
        print(f"Skipping calculation for {ticker}...")
        continue
    price["SMA30"] = price.Close.rolling(150).mean()
    price["Slope"] = np.gradient(price.SMA30)
    price["Slope"] = price.Slope.rolling(5).mean()
    result.append(price.sort_values(by="Date", ascending=False).iloc[[0]])

result = pd.concat(result)
filtered = result[result.Slope.round(3) >= -0.01].sort_values(by="Slope", ascending=False).reset_index()
print(filtered[["Date", "Ticker", "Slope"]].head(20))
