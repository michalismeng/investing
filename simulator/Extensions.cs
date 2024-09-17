
using System.Net.WebSockets;

public static class Extensions
{
    public static decimal GetQuarterPerformance(this List<TickerData> prices, int quarter)
    {
        if(prices.Count < quarter * 252 / 4)
            throw new Exception(String.Format("GetQuarterPerformance: Not enough price data. Expected at least {0}, found {1}", quarter * 252 / 4, prices.Count));

        var startPrice = prices.TakeLast(quarter * 252 / 4).First();
        var endPrice = prices.Last();
        return (endPrice.Close / startPrice.Close) - 1;
    }

    public static decimal GetStrength(this List<TickerData> prices)
    {
        var q1 = prices.GetQuarterPerformance(1);
        var q2 = prices.GetQuarterPerformance(2);
        var q3 = prices.GetQuarterPerformance(3);
        var q4 = prices.GetQuarterPerformance(4);

        return 0.4M * q1 + 0.2M * q2 + 0.2M * q3 + 0.2M * q4;
    }
}