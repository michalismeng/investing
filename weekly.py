import pandas as pd
from pandas.tseries.frequencies import to_offset
import mplfinance as mpf
import numpy as np

def get_consecutive_weeks(data):
    date_diff = data.index.to_series().diff().dt.days

    # Create a new column to indicate where a gap occurs
    # A gap occurs where the difference between consecutive dates is more than 1 day
    weekly_groups = data.groupby(pd.Grouper(freq='W'))

    # Find the start and end date of each weekly group
    date_ranges = weekly_groups.apply(lambda x: pd.Series({
        'start_date': x.index.min(),
        'end_date': x.index.max()
    }))

    # Display the start and end dates of consecutive segments
    return date_ranges['start_date'].tolist()

def is_trending_up(data, N):
    last_n_days = data.iloc[-N:]
    return all(last_n_days['Close'].diff().dropna() > 0)

data = pd.read_csv("AMZN.csv", index_col="Date", parse_dates=True)
ref = pd.read_csv("SPY.csv", index_col="Date", parse_dates=True)

logic = {'Open'  : 'first',
         'High'  : 'max',
         'Low'   : 'min',
         'Close' : 'last',
         'Volume': 'sum'}


data = data.resample('W').apply(logic)
data.index -= to_offset("6D")
ref = ref.resample('W').apply(logic)
ref.index -= to_offset("6D")


data['ma_10'] = data['Close'].rolling(window=10).mean().tolist()
data['ma_30'] = data['Close'].rolling(window=30).mean().tolist()
data['ma_40'] = data['Close'].rolling(window=40).mean().tolist()
data['52WL'] = data['Low'].rolling(window=52, center=False).min()
data['52WH'] = data['High'].rolling(window=52, center=False).max()

stage_2 = data[
    (data['Close'] > data['ma_30']) & (data['Close'] > data['ma_40']) &
    (data['ma_30'] > data['ma_40']) &
    (data['ma_10'] > data['ma_30']) & (data['ma_10'] > data['ma_40']) &
    (data['Close'] > data['ma_10']) & (data['Close'] > 1.3 * data['52WL']) &
    (data['Close'] > 0.75 * data['52WH'])
]

# This is wrong, it should be the ma_40 that we check for trending up
stage_2['is_trending_up'] = (data['Close'].rolling(window=4).apply(lambda x: all(np.diff(x) > 0), raw=True))
stage_2 = stage_2[(stage_2['is_trending_up'] == 1) & stage_2['Open'].notna()]

consec = get_consecutive_weeks(stage_2)
data.loc[stage_2.index, 'is_stage2'] = 1

if not stage_2.empty:
    ap = mpf.make_addplot(data['is_stage2'], type='scatter')
ap_2 = mpf.make_addplot(data['52WL'], type='line')
ap_3 = mpf.make_addplot(data['52WH'], type='line')
ap_4 = mpf.make_addplot(data['ma_10'], type='line', color='red')
ap_5 = mpf.make_addplot(data['ma_30'], type='line', color='green')
ap_6 = mpf.make_addplot(data['ma_40'], type='line', color='blue')
mpf.plot(data, type='candle', volume=True, style='yahoo', mav=(10, 30, 40), vlines=stage_2.index.tolist(), addplot=[ap, ap_2, ap_3])

# def quarters_perf(closes: pd.Series, n):
#     # import pdb; pdb.set_trace()
#     length = min(len(closes), n * int(252 / 4))
#     prices = closes.tail(length)
#     print("Quarter", n, "start price", prices[0], "end price", prices[-1])
#     pct_chg = prices.pct_change().dropna()
#     perf_cum = (pct_chg + 1).cumprod() - 1
#     return perf_cum.tail(1).item()

# Same as above, but faster 
def quarters_perf(closes: pd.Series, n):
    if len(closes) < (n * int(252 / 4)):
        return 0

    start_price = closes.iloc[-n * int(252 / 4)]  # Price 'n' quarters ago
    end_price = closes.iloc[-1]  # Price at the end of the period
    print("Quarter", n, "Start price", start_price, "end price", end_price)
    return (end_price / start_price) - 1  # Percentage change in price over the period


def strength(closes: pd.Series):
    """Calculates the performance of the last year (most recent quarter is weighted double)"""
    try:
        quarters1 = quarters_perf(closes, 1)
        quarters2 = quarters_perf(closes, 2)
        quarters3 = quarters_perf(closes, 3)
        quarters4 = quarters_perf(closes, 4)
        return 0.4*quarters1 + 0.2*quarters2 + 0.2*quarters3 + 0.2*quarters4
    except:
        return 0

def relative_strength(closes: pd.Series, closes_ref: pd.Series):
    rs_stock = strength(closes)
    rs_ref = strength(closes_ref)
    print("rs stock", rs_stock, "rs ref", rs_ref)
    rs = (1 + rs_stock) / (1 + rs_ref) * 100
    print("rs", rs)
    rs = int(rs*100) / 100 # round to 2 decimals
    return rs

print(relative_strength(data["Close"], ref["Close"]))

# if not stage_2.empty:
#     mpf.plot(data, type='candle', volume=True, style='yahoo', addplot=[ap, ap_2, ap_3, ap_4, ap_5, ap_6])
# else:
#     mpf.plot(data, type='candle', volume=True, style='yahoo', addplot=[ap_2, ap_3, ap_4, ap_5, ap_6])