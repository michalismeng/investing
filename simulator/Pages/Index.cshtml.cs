using System.Globalization;
using CsvHelper.Configuration.Attributes;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Skender.Stock.Indicators;

namespace simulator.Pages;

public class StockPrice : IQuote
{
    public DateTime Date { get; set; }
    public decimal Open { get; set ;}
    public decimal High { get; set ;}
    public decimal Low { get; set ;}
    public decimal Close => AdjClose;

    [Name("Adj Close")]
    public decimal AdjClose { get; set ;}
    public decimal Volume { get; set ;}
    public decimal? Strength { get; set ;}
}

public static class StockPriceExtensions
{
    // Helper function to get the ISO year for a given date
    public static int GetIsoYear(DateTime date)
    {
        CultureInfo cultureInfo = CultureInfo.CurrentCulture;
        Calendar calendar = cultureInfo.Calendar;
        return calendar.GetYear(date);
    }

    // Helper function to get the ISO week number of the year for a given date
    public static int GetIsoWeekOfYear(DateTime date)
    {
        CultureInfo cultureInfo = CultureInfo.InvariantCulture;
        Calendar calendar = cultureInfo.Calendar;

        CalendarWeekRule weekRule = cultureInfo.DateTimeFormat.CalendarWeekRule;
        DayOfWeek firstDayOfWeek = cultureInfo.DateTimeFormat.FirstDayOfWeek;

        return calendar.GetWeekOfYear(date, weekRule, firstDayOfWeek);
    }

    public static List<StockPrice> ToWeekly2(this List<StockPrice> dailyPrices)
    {
        // Group daily prices by year and week number
        var weeklyPrices = dailyPrices
            .GroupBy(p => new { Year = GetIsoYear(p.Date), Week = GetIsoWeekOfYear(p.Date) })
            .Select(group => new StockPrice
            {
                Date = group.First().Date,  // Use the first date in the group for reference
                Open = group.First().Open,  // The open price of the first day in the week
                High = group.Max(p => p.High),  // The highest price in the week
                Low = group.Min(p => p.Low),  // The lowest price in the week
                AdjClose = group.Last().Close,  // The close price of the last day in the week
                Volume = group.Sum(p => p.Volume)  // The total volume for the week
            })
            .ToList();

        return weeklyPrices;
    }

    public static List<StockPrice> ToWeekly(this List<StockPrice> dailyPrices) => 
        (from rec in dailyPrices
         group rec by rec.Date.AddDays(-(int)rec.Date.DayOfWeek) into g
         select new StockPrice {
          Low = g.Select(x => x.Low).Min(),
          High = g.Select(x => x.High).Max(),
          Open = g.MinBy(x => x.Date)!.Open,
          AdjClose = g.Last().AdjClose,
          Strength = g.Last().Strength,
          Volume = g.Sum(x => x.Volume),
          Date = g.First().Date.AddDays(-(int)g.First().Date.DayOfWeek + 1), // Add one to get on Monday
        }).ToList();
    
    public static List<StockPrice> Calculate52WeekHigh(this List<StockPrice> prices)
    {
        List<StockPrice> week_highs = [];

        for(int i = 52; i < prices.Count; i++)
        {
            // Find the date 52 weeks (1 year) back from the reference date
            var startDate = prices[i - 52].Date;

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
            var startDate = prices[i - 52].Date;

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

    // quarter_perf(data, n) =>
//     i = n
//     refCandle = i*oneYear/4
//     baseCandle = (i-1)*oneYear/4
//     while (not data[refCandle] and i > 1) 
//         i := i - 1
//         refCandle := i*oneYear/4
//         baseCandle := (i-1)*oneYear/4
    
//     ta.roc(data[baseCandle], refCandle)

// // first quarter is weighted more
// stock_performance = 0.4*quarter_perf(stock,1) + 0.2*quarter_perf(stock,2) + 0.2*quarter_perf(stock,3) + 0.2*quarter_perf(stock,4)
// ref_performance = 0.4*quarter_perf(ref,1) + 0.2*quarter_perf(ref,2) + 0.2*quarter_perf(ref,3) + 0.2*quarter_perf(ref,4)

    // Calculate quarterly performance for the nth previous quarter. Assume weekly data.
    // Calculation based on percentage change each week, which is compounded for the quarter to date.
    public static decimal GetQuarterPerformance(this List<StockPrice> prices, int quarters)
    {
        var length = Math.Min(prices.Count, quarters * 13);
        var latestPrices = prices.TakeLast(length).ToList();
        List<StockPrice> latestOneBefore = [new StockPrice() { AdjClose = 1 }, ..prices.SkipLast(1).TakeLast(length - 1).ToList()];
        var pct_changes = latestPrices.Zip(latestOneBefore).Select(x => (x.First.Close - x.Second.Close) / x.Second.Close).Skip(1).ToList(); 
        var perf_cum = pct_changes.Aggregate(1M, (acc, val) => acc * (val + 1)) - 1;
        return perf_cum;
    }

    public static decimal GetStrength(this List<StockPrice> prices)
    {
        var q1 = prices.GetQuarterPerformance(1);
        var q2 = prices.GetQuarterPerformance(2);
        var q3 = prices.GetQuarterPerformance(3);
        var q4 = prices.GetQuarterPerformance(4);

        return 0.4M * q1 + 0.2M * q2 + 0.2M * q3 + 0.2M * q4;
    }

    public static decimal GetRelativeStrength(this List<StockPrice> prices, List<StockPrice> reference)
    {
        // if(prices.TakeLast(52).Zip(reference.TakeLast(52)).Any(x => x.First.Date != x.Second.Date))
        //     throw new Exception("GetRelativeStrength: prices and reference must have matching dates");

        var rs_stock = prices.GetStrength();
        var rs_ref = reference.GetStrength();
        var rs = (1 + rs_stock) / (1 + rs_ref) * 100;
        var rs_final = (int)(rs * 100) / 100;
        return rs_final;
    }

    public static List<DateTime> GetStage2Weekly(this List<StockPrice> prices, List<StockPrice> reference)
    {
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
            var high52 = high_52.SingleOrDefault(x => x.Date == p.Date)?.AdjClose ?? -1;
            var low52 = low_52.SingleOrDefault(x => x.Date == p.Date)?.AdjClose ?? -1;

            var is_stage2 = p.AdjClose > ma30 && p.AdjClose > ma40 &&
                            ma30 > ma40 && ma10 > ma30 && ma10 > ma40 &&
                            p.AdjClose > ma10 && p.AdjClose > 1.3M * low52 &&
                            p.AdjClose > 0.75M * high52;
            
            var rs_rating = prices.Take(i).ToList().GetRelativeStrength(reference.Take(reference.FindIndex(x => x.Date == prices[i].Date)).ToList());

            var prev = ma_40.FindIndex(x => x.Date == p.Date) - 1;
            if(is_stage2 && prev >= 1 && ma40 > (decimal)ma_40[prev].Sma! && rs_rating > 70)
                dates.Add(p.Date);
            
        }

        return dates;
    }
}

public class IndexModel : PageModel
{
    private readonly ILogger<IndexModel> _logger;
    private readonly ApplicationDbContext _context;

    public IndexModel(ILogger<IndexModel> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public List<StockPrice> Records { get; set; } = [];
    public List<StockPrice> SPY { get; set; } = [];
    public List<SmaResult> MA_10 { get; set; } = [];
    public List<SmaResult> MA_30 { get; set; } = [];
    public List<SmaResult> MA_40 { get; set; } = [];
    public List<StockPrice> Week_High_52 { get; set; } = [];
    public List<StockPrice> Week_Low_52 { get; set; } = [];
    public List<DateTime> Stage2_Marks { get; set; } = [];

    public void OnGet(string? dateStart = null, string? dateEnd = null)
    {
        var records = _context.PriceData.Where(d => d.Ticker == "AMZN").ToList().Select(d => new StockPrice
        {
            AdjClose = d.Close,
            Date = d.Datetime,
            High = d.High,
            Low = d.Low,
            Open = d.Open,
            Volume = d.Volume,
            Strength = d.Strength,
        }).ToList().ToWeekly();
        Records = records;

        records = _context.PriceData.Where(d => d.Ticker == "SPY").ToList().Select(d => new StockPrice
        {
            AdjClose = d.Close,
            Date = d.Datetime,
            High = d.High,
            Low = d.Low,
            Open = d.Open,
            Volume = d.Volume,
            Strength = d.Strength,
        }).ToList().ToWeekly();
        SPY = records;

        if (dateStart != null)
        {
            var startDate = DateTime.Parse(dateStart);
            Records = Records.Where(p => p.Date >= startDate).ToList();
        }

        if (dateEnd != null)
        {
            var endDate = DateTime.Parse(dateEnd);
            Records = Records.Where(p => p.Date <= endDate).ToList();
        }

        MA_10 = Records.GetSma(10).Condense().ToList();
        MA_30 = Records.GetSma(30).Condense().ToList();
        MA_40 = Records.GetSma(40).Condense().ToList();
        Week_High_52 = Records.Calculate52WeekHigh();
        Week_Low_52 = Records.Calculate52WeekLow();
        Stage2_Marks = Records.GetStage2Weekly(SPY);
    }
}
