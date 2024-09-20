using simulator.Model;
using Skender.Stock.Indicators;

namespace simulator.Extensions;

public static class StockPriceExtensions
{
    public static decimal GetQuarterPerformance(this Span<TickerData> prices, int quarter)
    {
        if(prices.Length < quarter * 252 / 4)
            throw new Exception(string.Format("GetQuarterPerformance: Not enough price data. Expected at least {0}, found {1}", quarter * 252 / 4, prices.Length));

        var startPrice = prices[^(quarter * 252 / 4)];
        var endPrice = prices[^1];
        return (endPrice.Close / startPrice.Close) - 1;
    }

    public static decimal GetStrength(this Span<TickerData> prices)
    {
        var q1 = prices.GetQuarterPerformance(1);
        var q2 = prices.GetQuarterPerformance(2);
        var q3 = prices.GetQuarterPerformance(3);
        var q4 = prices.GetQuarterPerformance(4);

        return 0.4M * q1 + 0.2M * q2 + 0.2M * q3 + 0.2M * q4;
    }

    // If silent do not raise exception, instead return null for non-fatal errors
    public static decimal? GetRelativeStrength(this TickerData ticker, TickerData reference, bool silent = true)
    {
        if(ticker.Strength == null || reference.Strength == null)
        {
            return null;
            throw new Exception("GetRelativeStrength: Strength cannot be null");
        }
        if(ticker.Datetime != reference.Datetime)
            throw new Exception(string.Format("GetRelativeStrength: Ticker and reference must have the same date. The have {0} vs {1}",
                                                ticker.Datetime.ToShortDateString(), reference.Datetime.ToShortDateString()));

        var rs = (1 + ticker.Strength) / (1 + reference.Strength) * 100;
        return Math.Round(rs.Value, 2);
    }

    public static List<TickerData> QCut(this List<TickerData> tickers, int quantiles, bool silent = true)
    {
        if (tickers.Count < 1000)
        {
            if (!silent)
                throw new Exception($"QCut: The given array should have more than 1000 tickers, instead it has {tickers.Count}");
            else
                return [];
        }
        // Sort the values
        var sortedValues = tickers.Where(t => t.RelativeStrength != null).OrderBy(t => t.RelativeStrength).ToList();
        int n = sortedValues.Count;

        int bin = 0;
        // Assign each value to a bin
        foreach(var ticker in sortedValues)
        {
            int nextQuantilePosition = (bin + 1) * n / quantiles;
            if(nextQuantilePosition < sortedValues.Count && ticker.RelativeStrength >= sortedValues[nextQuantilePosition].RelativeStrength)
                bin++;

            ticker.Percentile = bin;
        }

        return sortedValues;
    }

    // TODO: Check whether the below toweekly conversion is better than what we have
    // // Helper function to get the ISO year for a given date
    // public static int GetIsoYear(DateTime date)
    // {
    //     CultureInfo cultureInfo = CultureInfo.CurrentCulture;
    //     Calendar calendar = cultureInfo.Calendar;
    //     return calendar.GetYear(date);
    // }

    // // Helper function to get the ISO week number of the year for a given date
    // public static int GetIsoWeekOfYear(DateTime date)
    // {
    //     CultureInfo cultureInfo = CultureInfo.InvariantCulture;
    //     Calendar calendar = cultureInfo.Calendar;

    //     CalendarWeekRule weekRule = cultureInfo.DateTimeFormat.CalendarWeekRule;
    //     DayOfWeek firstDayOfWeek = cultureInfo.DateTimeFormat.FirstDayOfWeek;

    //     return calendar.GetWeekOfYear(date, weekRule, firstDayOfWeek);
    // }

    // public static List<StockPrice> ToWeekly2(this List<StockPrice> dailyPrices)
    // {
    //     // Group daily prices by year and week number
    //     var weeklyPrices = dailyPrices
    //         .GroupBy(p => new { Year = GetIsoYear(p.Date), Week = GetIsoWeekOfYear(p.Date) })
    //         .Select(group => new StockPrice
    //         {
    //             Date = group.First().Date,  // Use the first date in the group for reference
    //             Open = group.First().Open,  // The open price of the first day in the week
    //             High = group.Max(p => p.High),  // The highest price in the week
    //             Low = group.Min(p => p.Low),  // The lowest price in the week
    //             AdjClose = group.Last().Close,  // The close price of the last day in the week
    //             Volume = group.Sum(p => p.Volume)  // The total volume for the week
    //         })
    //         .ToList();

    //     return weeklyPrices;
    // }

    public static List<TickerData> ToWeekly(this List<TickerData> dailyPrices) => 
        (from rec in dailyPrices
         group rec by rec.Datetime.AddDays(-(int)rec.Datetime.DayOfWeek) into g
         select new TickerData {
          Ticker = g.First().Ticker,
          Close = g.Last().Close,
          Percentile = g.Last().Percentile,
          ReferenceTicker = g.Last().ReferenceTicker,
          RelativeStrength = g.Last().RelativeStrength,
          Low = g.Select(x => x.Low).Min(),
          High = g.Select(x => x.High).Max(),
          Open = g.MinBy(x => x.Datetime)!.Open,
          Strength = g.Last().Strength,
          Volume = g.Sum(x => x.Volume),
          Datetime = g.First().Datetime.AddDays(-(int)g.First().Datetime.DayOfWeek + 1), // Add one to get on Monday
          Granularity = TickerDataGranulariry.Weekly,
        }).ToList();

    public static List<TickerData> Calculate52WeekHigh(this List<TickerData> prices)
    {
        if(prices.Any(p => p.Granularity != TickerDataGranulariry.Weekly))
            throw new Exception("Calculate52WeekHigh: All prices must be weekly.");

        List<TickerData> week_highs = [];

        for(int i = 52; i < prices.Count; i++)
        {
            // Find the date 52 weeks (1 year) back from the reference date
            var startDate = prices[i - 52].Date;

            // Filter the stock prices to include only those within the last 52 weeks
            var pricesInLast52Weeks = prices
                .Where(p => p.Date >= startDate && p.Date <= prices[i].Date);

            week_highs.Add(new TickerData
            {
                Ticker = prices.First().Ticker,
                Datetime = prices[i].Date,
                Close = pricesInLast52Weeks.MaxBy(x => x.High)!.High
            });
        }

        return week_highs;
    }

    public static List<TickerData> Calculate52WeekLow(this List<TickerData> prices)
    {
        if(prices.Any(p => p.Granularity != TickerDataGranulariry.Weekly))
            throw new Exception("Calculate52WeekLow: All prices must be weekly.");

        List<TickerData> week_highs = [];

        for(int i = 52; i < prices.Count; i++)
        {
            // Find the date 52 weeks (1 year) back from the reference date
            var startDate = prices[i - 52].Date;

            // Filter the stock prices to include only those within the last 52 weeks
            var pricesInLast52Weeks = prices
                .Where(p => p.Date >= startDate && p.Date <= prices[i].Date);

            week_highs.Add(new TickerData
            {
                Ticker = prices.First().Ticker,
                Datetime = prices[i].Date,
                Close = pricesInLast52Weeks.MinBy(x => x.Low)!.Low
            });
        }

        return week_highs;
    }

    public static List<DateTime> GetStage2Weekly(this List<TickerData> prices)
    {
        if(prices.Any(p => p.Granularity != TickerDataGranulariry.Weekly))
            throw new Exception("GetStage2Weekly: All prices must be weekly.");

        var ma_10 = prices.GetSma(10).ToList();
        var ma_30 = prices.GetSma(30).ToList();
        var ma_40 = prices.GetSma(40).ToList();
        var high_52 = prices.Calculate52WeekHigh();
        var low_52 = prices.Calculate52WeekLow();

        List<DateTime> dates = [];

        for(int i = 52; i < prices.Count; i++)
        {
            var p = prices[i];
            var ma10 = (decimal)(ma_10.SingleOrDefault(x => x.Date == p.Date)?.Sma ?? -1);
            var ma30 = (decimal)(ma_30.SingleOrDefault(x => x.Date == p.Date)?.Sma ?? -1);
            var ma40 = (decimal)(ma_40.SingleOrDefault(x => x.Date == p.Date)?.Sma ?? -1);
            var high52 = high_52.SingleOrDefault(x => x.Date == p.Date)?.Close ?? -1;
            var low52 = low_52.SingleOrDefault(x => x.Date == p.Date)?.Close ?? -1;

            var is_stage2 = p.Close > ma30 && p.Close > ma40 &&
                            ma30 > ma40 && ma10 > ma30 && ma10 > ma40 &&
                            p.Close > ma10 && p.Close > 1.3M * low52 &&
                            p.Close > 0.75M * high52;
            
            var prev = ma_40.FindIndex(x => x.Date == p.Date) - 1;
            if(is_stage2 && prev >= 0 && ma40 > (decimal)ma_40[prev].Sma! && prices[i].Percentile > 70)
                dates.Add(p.Date);
            
        }

        return dates;
    }
}