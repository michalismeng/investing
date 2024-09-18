
using Skender.Stock.Indicators;

public static class Extensions
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
}