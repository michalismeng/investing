import pandas as pd

# Sample DataFrame with a datetime index
data = pd.DataFrame({
    'value': [1, 2, 3, 4, 5, 6, 7, 8]
}, index=pd.to_datetime(['2023-01-01', '2023-01-02', '2023-01-03', 
                         '2023-01-05', '2023-01-06', '2023-01-07',
                         '2023-01-09', '2023-01-10']))

# Find gaps by calculating the difference between consecutive dates
date_diff = data.index.to_series().diff().dt.days

# Create a new column to indicate where a gap occurs
# A gap occurs where the difference between consecutive dates is more than 1 day
data['segment'] = (date_diff != 1).cumsum()
print(data['segment'])

# Group by segment and find the start and end dates for each segment
date_ranges = data.groupby('segment').apply(lambda x: pd.Series({
    'start_date': x.index.min(),
    'end_date': x.index.max()
}))

# Display the start and end dates of consecutive segments
print(date_ranges['start_date'].tolist())