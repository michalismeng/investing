import pandas as pd
from pandas.tseries.frequencies import to_offset
import mplfinance as mpf

def get_consecutive_days(data):
    date_diff = data.index.to_series().diff().dt.days

    # Create a new column to indicate where a gap occurs
    # A gap occurs where the difference between consecutive dates is more than 1 day
    data['segment'] = (date_diff != 1).cumsum()

    # Group by segment and find the start and end dates for each segment
    date_ranges = data.groupby('segment').apply(lambda x: pd.Series({
        'start_date': x.index.min(),
        'end_date': x.index.max()
    }))

    # Display the start and end dates of consecutive segments
    return date_ranges['start_date'].tolist()

data = pd.read_csv("hist/A.csv", index_col="Date", parse_dates=True)

df = data

data['ma_50'] = data['Close'].rolling(window=50).mean().tolist()
data['ma_150'] = data['Close'].rolling(window=150).mean().tolist()
data['ma_200'] = data['Close'].rolling(window=200).mean().tolist()
data['52WL'] = data['Low'].rolling(window=252, center=False).min()
data['52WH'] = data['High'].rolling(window=252, center=False).max()
# ap = mpf.make_addplot(moving_average, type='line')
# ap_2 = mpf.make_addplot(moving_average_200, type='line')
# mpf.plot(data, type='candle', volume=True, style='yahoo', mav=(50), addplot=[ap, ap_2])

stage_2 = data[
    (data['Close'] > data['ma_150']) & (data['Close'] > data['ma_200']) &
    (data['ma_150'] > data['ma_200']) &
    (data['ma_50'] > data['ma_150']) & (data['ma_50'] > data['ma_200']) &
    (data['Close'] > data['ma_50']) & (data['Close'] > 1.3 * data['52WL']) &
    (data['Close'] > 0.75 * data['52WH'])
]

consec = get_consecutive_days(stage_2)

data.loc[stage_2.index, 'is_stage2'] = 1

ap = mpf.make_addplot(data['is_stage2'], type='scatter')
ap_2 = mpf.make_addplot(data['52WL'], type='line')
ap_3 = mpf.make_addplot(data['52WH'], type='line')
mpf.plot(data, type='candle', volume=True, style='yahoo', mav=(50, 150, 200), addplot=[ap, ap_2, ap_3])

