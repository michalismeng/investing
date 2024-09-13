using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration.Attributes;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace simulator.Pages;

public class StockPrice
{
    public DateOnly Date { get; set; }
    public decimal Open { get; set ;}
    public decimal High { get; set ;}
    public decimal Low { get; set ;}
    public decimal Close { get; set ;}
    [Name("Adj Close")]
    public decimal AdjClose { get; set ;}
    public decimal Volume { get; set ;}
}

public static class StockPriceExtensions
{
    public static List<StockPrice> ToWeekly(this List<StockPrice> dailyPrices) => 
        (from rec in dailyPrices
         group rec by rec.Date.AddDays(-(int)rec.Date.DayOfWeek) into g
         select new StockPrice {
          Low = g.Select(x => x.Low).Min(),
          High = g.Select(x => x.High).Max(),
          Open = g.MinBy(x => x.Date)!.Open,
          AdjClose = g.MaxBy(x => x.Date)!.AdjClose,
          Close = g.Last().Close,
          Volume = g.Sum(x => x.Volume),
          Date = g.First().Date.AddDays(-(int)g.First().Date.DayOfWeek),
        }).ToList();
    
    public static List<StockPrice> CalculateMovingAverage(this List<StockPrice> prices, int N)
    {
        List<StockPrice> movingAverages = [];

        // Handle edge cases
        if (prices == null || prices.Count < N || N <= 0)
            return movingAverages;

        // Initialize the sum of the first window
        decimal windowSum = 0;

        // Sum the first N elements
        for (int i = 0; i < N; i++)
            windowSum += prices[i].AdjClose;

        // Add the average of the first window
        movingAverages.Add(new StockPrice()
        {
            Date = prices[N - 1].Date,
            AdjClose = windowSum / N,
        });

        // Sliding window: iterate through the list starting from the (N+1)th element
        for (int i = N; i < prices.Count; i++)
        {
            // Update the window sum by subtracting the element that is sliding out of the window
            // and adding the new element
            windowSum = windowSum - prices[i - N].AdjClose + prices[i].AdjClose;

            // Add the average of the current window
            movingAverages.Add(new StockPrice()
            {
                Date = prices[i].Date,
                AdjClose = windowSum / N,
            });
        }

        return movingAverages;
    }

    public static List<StockPrice> Calculate52WeekHigh(this List<StockPrice> prices)
    {
        List<StockPrice> week_highs = [];

        for(int i = 52; i < prices.Count; i++)
        {
            // Find the date 52 weeks (1 year) back from the reference date
            DateOnly startDate = prices[i - 52].Date;

            // Filter the stock prices to include only those within the last 52 weeks
            var pricesInLast52Weeks = prices
                .Where(p => p.Date >= startDate && p.Date <= prices[i].Date);

            week_highs.Add(new StockPrice
            {
                Date = prices[i].Date,
                AdjClose = pricesInLast52Weeks.MaxBy(x => x.High)!.High
            });
        }

        return week_highs;
    }

    public static List<StockPrice> Calculate52WeekLow(this List<StockPrice> prices)
    {
        List<StockPrice> week_highs = [];

        for(int i = 52; i < prices.Count; i++)
        {
            // Find the date 52 weeks (1 year) back from the reference date
            DateOnly startDate = prices[i - 52].Date;

            // Filter the stock prices to include only those within the last 52 weeks
            var pricesInLast52Weeks = prices
                .Where(p => p.Date >= startDate && p.Date <= prices[i].Date);

            week_highs.Add(new StockPrice
            {
                Date = prices[i].Date,
                AdjClose = pricesInLast52Weeks.MinBy(x => x.Low)!.Low
            });
        }

        return week_highs;
    }

    public static List<DateOnly> GetStage2(this List<StockPrice> prices)
    {
        var ma_10 = prices.CalculateMovingAverage(10);
        var ma_30 = prices.CalculateMovingAverage(30);
        var ma_40 = prices.CalculateMovingAverage(40);
        var high_52 = prices.Calculate52WeekHigh();
        var low_52 = prices.Calculate52WeekLow();

        List<DateOnly> dates = [];

        for(int i = 52; i < prices.Count; i++)
        {
            var p = prices[i];
            var ma10 = ma_10.SingleOrDefault(x => x.Date == p.Date)?.AdjClose ?? -1;
            var ma30 = ma_30.SingleOrDefault(x => x.Date == p.Date)?.AdjClose ?? -1;
            var ma40 = ma_40.SingleOrDefault(x => x.Date == p.Date)?.AdjClose ?? -1;
            var high52 = high_52.SingleOrDefault(x => x.Date == p.Date)?.AdjClose ?? -1;
            var low52 = low_52.SingleOrDefault(x => x.Date == p.Date)?.AdjClose ?? -1;

            var is_stage2 = p.AdjClose > ma30 && p.AdjClose > ma40 &&
                            ma30 > ma40 && ma10 > ma30 && ma10 > ma40 &&
                            p.AdjClose > ma10 && p.AdjClose > 1.3M * low52 &&
                            p.AdjClose > 0.75M * high52;
            
            var three_month_rs  = 0.4M * p.AdjClose / prices[i - 13].AdjClose;
            var six_month_rs    = 0.2M * p.AdjClose / (prices[i - 26].AdjClose * 2);
            var nine_month_rs   = 0.2M * p.AdjClose / (prices[i - 39].AdjClose * 3);
            var twelve_month_rs = 0.2M * p.AdjClose / (prices[i - 52].AdjClose * 4);
            var rs_rating = (three_month_rs + six_month_rs + nine_month_rs + twelve_month_rs) * 100;

            var prev = ma_40.FindIndex(x => x.Date == p.Date) - 1;
            if(is_stage2 && prev >= 1 && ma40 > ma_40[prev].AdjClose && rs_rating > 80)
                dates.Add(p.Date);
            
        }

        System.Console.WriteLine("dates {0}", dates.Count);
        return dates;
    }
}

public class IndexModel : PageModel
{
    private readonly ILogger<IndexModel> _logger;

    public IndexModel(ILogger<IndexModel> logger)
    {
        _logger = logger;
    }

    public List<StockPrice> Records { get; set; } = [];
    public List<StockPrice> MA_10 { get; set; } = [];
    public List<StockPrice> MA_30 { get; set; } = [];
    public List<StockPrice> MA_40 { get; set; } = [];
    public List<StockPrice> Week_High_52 { get; set; } = [];
    public List<StockPrice> Week_Low_52 { get; set; } = [];
    public List<DateOnly> Stage2_Marks { get; set; } = [];

    public void OnGet(string? dateStart = null, string? dateEnd = null)
    {
        using var reader = new StreamReader("./AMZN.csv");
        using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
        Records = csv.GetRecords<StockPrice>().ToList().ToWeekly();

        if (dateStart != null)
        {
            DateOnly startDate = DateOnly.Parse(dateStart);
            Records = Records.Where(p => p.Date >= startDate).ToList();
        }

        if (dateEnd != null)
        {
            DateOnly endDate = DateOnly.Parse(dateEnd);
            Records = Records.Where(p => p.Date <= endDate).ToList();
        }


        MA_10 = Records.CalculateMovingAverage(10);
        MA_30 = Records.CalculateMovingAverage(30);
        MA_40 = Records.CalculateMovingAverage(40);
        Week_High_52 = Records.Calculate52WeekHigh();
        Week_Low_52 = Records.Calculate52WeekLow();
        Stage2_Marks = Records.GetStage2();
    }
}
