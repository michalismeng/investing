using System.Collections.Concurrent;
using System.Diagnostics;
using System.Runtime.InteropServices;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using simulator.Extensions;
using simulator.Model;
using Skender.Stock.Indicators;

namespace simulator.Pages;

public class WatchlistTickerInfoModel
{
    public TickerInfo Ticker { get; set; }
    public TickerData PriceData { get; set; }
    public List<TickerData> PriceDataFuture { get; set; } = [];
    public List<(QuarterlyEarningsEntry entry, decimal? change, decimal? smooth)> Earnings { get; set; } = [];
    public List<(AnnualEarningsEntry entry, decimal? change, decimal? smooth)> AnnualEarnings { get; set; } = [];
    public List<(QuarterlyIncomeStatement entry, decimal? change, decimal? smooth)> Income { get; set; } = [];
    public decimal? MarketCap { get; set; }
    public decimal? SharesOutstanding { get; set; }
    public decimal VolumeSMA50 { get; set; }
    public (DateTime, double?) Volatility { get; set; }
}

public class WatchlistFiltersModel
{
    public DateTime Date { get; set; }
    public decimal Volume { get; set; }
    public decimal EarningsGrowth { get; set; }
    public int EarningsGrowthQuarters { get; set; }
    public decimal MaxDropOverSPY { get; set; }
    public decimal SharesOutstanding { get; set; }
}

public class WatchlistModel : PageModel
{
    private readonly ILogger<IndexModel> _logger;
    private readonly ApplicationDbContext _context;

    public WatchlistModel(ILogger<IndexModel> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public List<WatchlistTickerInfoModel> Tickers { get; set; } = [];
    [FromQuery]
    public WatchlistFiltersModel Filters { get; set; } = new WatchlistFiltersModel();
    public DateTime Date { get; set; }

    public IActionResult OnGet()
    {
        // Htmx request
        if(HttpContext.Request.Headers.ContainsKey("Hx-Request"))
        {
            DoWork(Filters);
            return Partial("_WatchlistTable", (Tickers, Filters.Date));
        }
        else
        {
            if(Filters.Date == default)
            {
                Filters.Date = new DateTime(2015, 02, 02);
                Filters.Volume = 200000;
                Filters.EarningsGrowth = 0.2M;
                Filters.EarningsGrowthQuarters = 4;
                Filters.MaxDropOverSPY = 0.2M;
                Filters.SharesOutstanding = 50000000;
                Date = Filters.Date;
            }
            return Page();
        }
    }

    private void DoWork(WatchlistFiltersModel filters)
    {
        var isStage2CalculationMissing = _context.PriceData.Any(p => p.Date == filters.Date && p.IsStage2 == null);
        if(isStage2CalculationMissing)
            throw new Exception(string.Format("Watchlist: Stage 2 calculation hasn't happened for {0}. Consider running the CLI task.", filters.Date));

        System.Console.WriteLine("Getting stage 2 companies...");
        var stage2 = _context.PriceData.Where(p => p.Date == filters.Date && p.IsStage2 == true)
                                       .ToList();
        System.Console.WriteLine("Found {0} companies in total", stage2.Count);

        var startDate = filters.Date.AddYears(-5);
        System.Console.WriteLine("Getting price data for 5 years...");
        var prices = _context.PriceData.Where(p => startDate <= p.Date && p.Date <= filters.Date && (stage2.Select(s => s.Ticker).Contains(p.Ticker) || p.Ticker == "SPY"))
                                       .ToList();

        System.Console.WriteLine("Getting quarterly earnings data for the last 4 + 4 quarters...");
        startDate = filters.Date.AddYears(-4);
        var earnings = _context.QuarterlyEarnings.Where(p => startDate <= p.FiscalDateEnding && p.FiscalDateEnding <= filters.Date && stage2.Select(s => s.Ticker).Contains(p.Ticker))
                                                 .ToList();

        System.Console.WriteLine("Getting sales data for the last 4 + 4 quarters...");
        var sales = _context.QuarterlyIncomeStatements.Where(p => startDate <= p.FiscalDateEnding && p.FiscalDateEnding <= filters.Date && stage2.Select(s => s.Ticker).Contains(p.Ticker))
                                                      .ToList();

        System.Console.WriteLine("Getting annual earnings data for the last 5 years...");
        startDate = filters.Date.AddYears(-6);
        var annualEarnings = _context.AnnualEarnings.Where(p => startDate <= p.FiscalDateEnding && p.FiscalDateEnding <= filters.Date && stage2.Select(s => s.Ticker).Contains(p.Ticker))
                                                    .ToList();

        System.Console.WriteLine("Getting latest balance sheet...");
        startDate = filters.Date.AddMonths(-4); // Should be 3 months, but do 4 to be sure
        var balance = _context.QuarterlyBalanceSheets.Where(p => startDate <= p.FiscalDateEnding && p.FiscalDateEnding <= filters.Date && stage2.Select(s => s.Ticker).Contains(p.Ticker))
                                                     .ToList();


        System.Console.WriteLine("Getting max drop of SPY in the last 2 years...");
        var maxDropSPY = prices.Where(t => t.Ticker == "SPY" && t.Date >= filters.Date.AddYears(-2)).OrderBy(p => p.Date).ToList().CalculateGreatestDropPercentage();
        System.Console.WriteLine("Max drop of SPY is {0}", maxDropSPY.Round());

        System.Console.WriteLine("Applying filters to historical data...");
        Tickers = [.. prices.GroupBy(g => g.Ticker).Where(g => g.Key != "SPY").Select(g => new
        {
            Ticker = g.Key,
            SMA40 = (decimal)g.OrderBy(x => x.Date).GetSma(200).Last().Sma!,
            VolumeSMA50 = (decimal)g.Select(x => new TickerData() { Date = x.Date, Ticker = x.Ticker, Close = x.Volume }).OrderBy(x => x.Date).GetSma(50).Last().Sma!,
            MaxDrop2Y = g.Where(x => x.Date >= filters.Date.AddYears(-2)).OrderBy(x => x.Date).ToList().CalculateGreatestDropPercentage(),
            PriceData = g.Last(),
            // We need 9 quarters: 8 will give us 4 quarters with yoy change and we need 1 more for the smoothing 
            Earnings = earnings.Where(e => e.Ticker == g.Key).OrderByDescending(e => e.FiscalDateEnding).Take(9).ToList().GetYearOverYearChange().Smooth(),
            AnnualEarnings = annualEarnings.Where(e => e.Ticker == g.Key).OrderByDescending(e => e.FiscalDateEnding).Take(6).ToList().GetYearOverYearChange().Smooth(),
            Sales = sales.Where(e => e.Ticker == g.Key).OrderByDescending(e => e.FiscalDateEnding).Take(9).ToList().GetYearOverYearChange().Smooth(),
            MarketCap = balance.Where(e => e.Ticker == g.Key).OrderByDescending(e => e.FiscalDateEnding).FirstOrDefault()?.MarketCap(g.Last().Close),
            SharesOutstanding = balance.Where(e => e.Ticker == g.Key).OrderByDescending(e => e.FiscalDateEnding).FirstOrDefault()?.SharesOutstanding,
            Volatility = g.OrderBy(x => x.Date).GetStdDev(5).Last(),
        }).Where(p => p.VolumeSMA50 >= filters.Volume &&      // Ensure there is enough volume.
                      p.Earnings.Count >= 0 && p.Earnings.Where(e => e.change.HasValue).Count() >= filters.EarningsGrowthQuarters &&
                      p.Earnings.Take(filters.EarningsGrowthQuarters).All(e => e.change.HasValue == false || e.change >= filters.EarningsGrowth) &&      // latest 4 quarters should have 20% yoy increase
                      ( p.SharesOutstanding.HasValue == false || p.SharesOutstanding <= filters.SharesOutstanding) &&
                      p.MaxDrop2Y <= maxDropSPY + filters.MaxDropOverSPY)
          .Select(st => new WatchlistTickerInfoModel()
          {
            Ticker = _context.Tickers.FirstOrDefault(x => x.Ticker == st.Ticker)!,
            PriceData = st.PriceData,
            Earnings = st.Earnings,
            AnnualEarnings = st.AnnualEarnings,
            Income = st.Sales,
            MarketCap = st.MarketCap,
            SharesOutstanding = st.SharesOutstanding,
            VolumeSMA50 = st.VolumeSMA50,
            Volatility = (st.Volatility.Date, st.Volatility.StdDev),
            PriceDataFuture = [ _context.PriceData.Where(p => p.Ticker == st.Ticker && p.Date >= st.PriceData.Date.AddMonths(1))
                                            .OrderBy(p => p.Date - st.PriceData.Date.AddMonths(1))      // This is our own check
                                            .Take(1).SingleOrDefault(),
                                _context.PriceData.Where(p => p.Ticker == st.Ticker && p.Date >= st.PriceData.Date.AddMonths(2))
                                            .OrderBy(p => p.Date - st.PriceData.Date.AddMonths(2))      // 7-point method suggests 8 weeks as a make-or-break
                                            .Take(1).SingleOrDefault(),
                                _context.PriceData.Where(p => p.Ticker == st.Ticker && p.Date >= st.PriceData.Date.AddDays(13 * 7))
                                            .OrderBy(p => p.Date - st.PriceData.Date.AddDays(13 * 7))   // And 13 weeks is the maximum time span
                                            .Take(1).SingleOrDefault()]
          }).Where(x => x.Ticker != null && x.PriceData != null).OrderByDescending(x => x.PriceData.RelativeStrength)];
        System.Console.WriteLine("Finished");

    }
}


