using NoAlloq;
using simulator.Model;
using Skender.Stock.Indicators;

namespace simulator.Extensions;

public static class StockPriceExtensions
{
    public static decimal GetQuarterPerformance(this Span<TickerData> prices, int quarter)
    {
        if(prices.Any(p => p.Granularity != TickerDataGranulariry.Daily))
            throw new Exception("GetQuarterPerformance: All prices must be daily.");

        if(prices.Length < quarter * 252 / 4)
            throw new Exception(string.Format("GetQuarterPerformance: Not enough price data. Expected at least {0}, found {1}", quarter * 252 / 4, prices.Length));

        var startPrice = prices[^(quarter * 252 / 4)];
        var endPrice = prices[^1];
        return (endPrice.Close / startPrice.Close) - 1;
    }

    public static decimal GetStrength(this Span<TickerData> prices)
    {
        if(prices.Any(p => p.Granularity != TickerDataGranulariry.Daily))
            throw new Exception("GetQuarterPerformance: All prices must be daily.");

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
        if(ticker.Date != reference.Date)
            throw new Exception(string.Format("GetRelativeStrength: Ticker and reference must have the same date. The have {0} vs {1}",
                                                ticker.Date.ToShortDateString(), reference.Date.ToShortDateString()));

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
         group rec by rec.Date.AddDays(-(int)rec.Date.DayOfWeek) into g
         select new TickerData {
          Ticker = g.First().Ticker,
          Close = g.Last().Close,
          Percentile = g.Last().Percentile,
          ReferenceTicker = g.Last().ReferenceTicker,
          RelativeStrength = g.Last().RelativeStrength,
          Low = g.Select(x => x.Low).Min(),
          High = g.Select(x => x.High).Max(),
          Open = g.MinBy(x => x.Date)!.Open,
          Strength = g.Last().Strength,
          Volume = g.Sum(x => x.Volume),
          Date = g.First().Date.AddDays(-(int)g.First().Date.DayOfWeek + 1), // Add one to get on Monday
          Granularity = TickerDataGranulariry.Weekly,
        }).ToList();

    public static List<TickerData> Calculate52WeekHigh(this List<TickerData> prices)
    {
        bool isDaily = prices.All(p => p.Granularity == TickerDataGranulariry.Daily);
        bool isWeekly = prices.All(p => p.Granularity == TickerDataGranulariry.Weekly);
        if(!isDaily && !isWeekly)
            throw new Exception("Calculate52WeekHigh: Prices must have the same granularity, either daily or weekly.");

        int startIndex = isDaily ? 252 : 52;    // 252 trading days in a year or 52 weeks

        List<TickerData> week_highs = [];

        for(int i = startIndex; i < prices.Count; i++)
        {
            var startDate = prices[i - startIndex].Date;

            // Filter the stock prices to include only those within the last 52 weeks
            var pricesInLast52Weeks = prices
                .Where(p => p.Date >= startDate && p.Date <= prices[i].Date);

            week_highs.Add(new TickerData
            {
                Ticker = prices.First().Ticker,
                Date = prices[i].Date,
                Close = pricesInLast52Weeks.MaxBy(x => x.High)!.High
            });
        }

        return week_highs;
    }

    public static List<TickerData> Calculate52WeekLow(this List<TickerData> prices)
    {
        bool isDaily = prices.All(p => p.Granularity == TickerDataGranulariry.Daily);
        bool isWeekly = prices.All(p => p.Granularity == TickerDataGranulariry.Weekly);
        if(!isDaily && !isWeekly)
            throw new Exception("Calculate52WeekLow: Prices must have the same granularity, either daily or weekly.");

        int startIndex = isDaily ? 252 : 52;    // 252 trading days in a year or 52 weeks

        List<TickerData> week_highs = [];

        for(int i = startIndex; i < prices.Count; i++)
        {
            var startDate = prices[i - startIndex].Date;

            // Filter the stock prices to include only those within the last 52 weeks
            var pricesInLast52Weeks = prices
                .Where(p => p.Date >= startDate && p.Date <= prices[i].Date);

            week_highs.Add(new TickerData
            {
                Ticker = prices.First().Ticker,
                Date = prices[i].Date,
                Close = pricesInLast52Weeks.MinBy(x => x.Low)!.Low
            });
        }

        return week_highs;
    }

    public static List<DateTime> GetStage2ForLastDay(this List<TickerData> prices) => prices.GetStage2(startFrom: prices.Count - 1);
    public static bool IsLastDayStage2(this List<TickerData> prices) => prices.GetStage2(startFrom: prices.Count - 1).Contains(prices.Last().Date);

    public static List<DateTime> GetStage2(this List<TickerData> prices, int startFrom = 0)
    {
        bool isDaily = prices.All(p => p.Granularity == TickerDataGranulariry.Daily);
        bool isWeekly = prices.All(p => p.Granularity == TickerDataGranulariry.Weekly);
        if(!isDaily && !isWeekly)
            throw new Exception("GetStage2: Prices must have the same granularity, either daily or weekly.");

        var maShort = prices.GetSma(isWeekly ? 10 : 50).ToList();
        var maMedium = prices.GetSma(isWeekly ? 30 : 150).ToList();
        var maLong = prices.GetSma(isWeekly ? 40 : 200).ToList();
        var high52 = prices.Calculate52WeekHigh();
        var low52 = prices.Calculate52WeekLow();

        int startIndex = isWeekly ? 52 : 252;
        int loopStartIndex = Math.Max(startIndex, startFrom);

        List<DateTime> dates = [];

        for(int i = loopStartIndex; i < prices.Count; i++)
        {
            var datePrice = prices[i];
            var dateMAShort = (decimal)(maShort.SingleOrDefault(x => x.Date == datePrice.Date)?.Sma ?? -1);
            var dateMAMedium = (decimal)(maMedium.SingleOrDefault(x => x.Date == datePrice.Date)?.Sma ?? -1);
            var dateMaLong = (decimal)(maLong.SingleOrDefault(x => x.Date == datePrice.Date)?.Sma ?? -1);
            var dateHigh52 = high52[i - startIndex].Close;
            var dateLow52 = low52[i - startIndex].Close;

            // Check high, low and price dates are aligned
            if(low52[i - startIndex].Date != high52[i - startIndex].Date || high52[i - startIndex].Date != datePrice.Date)
                throw new Exception(string.Format("GetStage2: Bad dates for i = {0}. High {1} while price {2}", i, high52[i - startIndex].Date, datePrice.Date));

            var technicals = datePrice.Close > dateMAMedium && datePrice.Close > dateMaLong &&
                             dateMAMedium > dateMaLong && dateMAShort > dateMAMedium && dateMAShort > dateMaLong &&
                             datePrice.Close > dateMAShort && datePrice.Close > 1.3M * dateLow52 &&
                             datePrice.Close > 0.75M * dateHigh52;
            
            // We need at least one month of the long moving average, so get 1 and 1/2. We can roll out stronger version as well, with more months
            var maLongPrevMonth = maLong.Where(x => x.Date.Date >= datePrice.Date.AddMonths(-1).AddDays(-15).Date && x.Date.Date <= datePrice.Date.Date).ToList();
            if(technicals && IsNonDecreasing(maLongPrevMonth) && prices[i].Percentile > 70)
                dates.Add(datePrice.Date);
        }

        return dates;
    }

    public static bool IsNonDecreasing(List<SmaResult> values)
    {
        for (int i = 1; i < values.Count; i++)
            if (values[i].Sma < values[i - 1].Sma)
                return false;
        return true;
    }

    public static decimal CalculateGreatestDropPercentage(this List<TickerData> stockPrices)
    {
        if (stockPrices == null || stockPrices.Count < 2)
        {
            throw new ArgumentException("There must be at least two prices to calculate a drop.");
        }

        var maxPrice = stockPrices[0]; // Initialize max price to the first price in the list
        decimal greatestDropPercentage = 0m; // Initialize the greatest drop percentage

        // Iterate through the list starting from the second price
        for (int i = 1; i < stockPrices.Count; i++)
        {
            var currentPrice = stockPrices[i];

            // Calculate the drop from the max price found so far
            if (currentPrice.Low < maxPrice.High)
            {
                decimal dropPercentage = (maxPrice.High - currentPrice.Low) / maxPrice.High;

                // Update the greatest drop percentage if the current drop is larger
                if (dropPercentage > greatestDropPercentage)
                    greatestDropPercentage = dropPercentage;
            }

            // Update the max price if the current price is higher than the previous max
            if (currentPrice.High > maxPrice.High)
                maxPrice = currentPrice;
        }

        return greatestDropPercentage;
    }

    public static decimal Round(this decimal d) => Math.Round(d, 2);
    public static decimal? Round(this decimal? d) => d != null ? Math.Round(d.Value, 2) : null;

    public static List<(T entry, decimal? smooth)> Smooth<T>(List<T> entries, Func<T, decimal?> valueFunc)
    {
        if(entries.Count > 1)
            return [..entries.Zip(entries.Skip(1)).Select(x => (x.First, smooth: (valueFunc(x.First) + valueFunc(x.Second)) / 2))];
        else
            return entries.Select(x => (x, (decimal?)null)).ToList();
    }

    public static List<(QuarterlyEarningsEntry entry, decimal? change, decimal? smooth)> Smooth(this List<(QuarterlyEarningsEntry entry, decimal? change)> entries) =>
        [.. Smooth(entries, e => e.change).Select(x => (x.entry.entry, x.entry.change, x.smooth))];

    public static List<(AnnualEarningsEntry entry, decimal? change, decimal? smooth)> Smooth(this List<(AnnualEarningsEntry entry, decimal? change)> entries) =>
        [.. Smooth(entries, e => e.change).Select(x => (x.entry.entry, x.entry.change, x.smooth))];

    /// <summary>
    /// Get year over year change in the given entries. Assume the entries as sorted in descending datetime order!
    /// </summary>
    public static List<(T entry, decimal? change)> GetYearOverYearChange<T>(List<T> entries, Func<T, decimal?> valueFunc, int period)
    {
        var result = new List<(T entry, decimal? change)>();
        if(entries.Count <= period)
            result = entries.Select(e => (entry: e, change: (decimal?)null)).ToList();
        else
        {
            for(int i = 0; i < entries.Count - period; i++)
            {
                if(entries[i + period] == null || valueFunc(entries[i + period]) == 0)
                    result.Add((entries[i], -1));
                else
                {
                    decimal? change = (valueFunc(entries[i]) - valueFunc(entries[i + period])) / Math.Abs(valueFunc(entries[i + period])!.Value);
                    result.Add((entries[i], change));
                }
            }

            if(entries.Count < 2 * period)
            {
                for(int i = entries.Count - period + 1; i <= period; i++)
                    result.Add((entries[i], null));
            }
        }

        return result;
    }

    /// <summary>
    /// Get year over year change in the given earnings entries. Assume the entries as sorted in descending datetime order!
    /// </summary>
    /// <param name="entries"></param>
    /// <returns></returns>
    public static List<(QuarterlyEarningsEntry entry, decimal? change)> GetYearOverYearChange(this List<QuarterlyEarningsEntry> entries) => GetYearOverYearChange(entries, e => e.ReportedEPS, 4);

    /// <summary>
    /// Get year over year change in the given annual earnings entries. Assume the entries as sorted in descending datetime order!
    /// </summary>
    /// <param name="entries"></param>
    /// <returns></returns>
    public static List<(AnnualEarningsEntry entry, decimal? change)> GetYearOverYearChange(this List<AnnualEarningsEntry> entries) => GetYearOverYearChange(entries, e => e.ReportedEPS, 1);
}