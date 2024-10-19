using System.Collections.Concurrent;
using System.Diagnostics;
using System.Runtime.InteropServices;
using Microsoft.AspNetCore.Mvc.RazorPages;
using simulator.Extensions;
using simulator.Model;
using Skender.Stock.Indicators;

namespace simulator.Pages;

public class WatchlistTickerInfoModel
{
    public TickerInfo Ticker { get; set; }
    public TickerData PriceData { get; set; }
    public List<(QuarterlyEarningsEntry entry, decimal? change, decimal? smooth)> Earnings { get; set; } = [];
    public List<(AnnualEarningsEntry entry, decimal? change, decimal? smooth)> AnnualEarnings { get; set; } = [];
    public List<(QuarterlyIncomeStatement entry, decimal? change, decimal? smooth)> Income { get; set; } = [];
    public decimal? MarketCap { get; set; }
    public decimal? SharesOutstanding { get; set; }
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
    public DateTime Date { get; set; }

    public void OnGet(string? date = null)
    {
        Date = date != null ? DateTime.Parse(date) : DateTime.Today.AddDays(-1);

        System.Console.WriteLine("Getting stage 2 companies...");
        var stage2 = _context.PriceData.Where(p => p.Date == Date && p.IsStage2 == true)
                                       .ToList();

        var startDate = Date.AddYears(-5);
        System.Console.WriteLine("Getting price data for 5 years...");
        var prices = _context.PriceData.Where(p => startDate <= p.Date && p.Date <= Date && (stage2.Select(s => s.Ticker).Contains(p.Ticker) || p.Ticker == "SPY"))
                                       .ToList();

        System.Console.WriteLine("Getting quarterly earnings data for the last 4 + 4 quarters...");
        startDate = Date.AddYears(-4);
        var earnings = _context.QuarterlyEarnings.Where(p => startDate <= p.FiscalDateEnding && p.FiscalDateEnding <= Date && stage2.Select(s => s.Ticker).Contains(p.Ticker))
                                                 .ToList();

        System.Console.WriteLine("Getting sales data for the last 4 + 4 quarters...");
        var sales = _context.QuarterlyIncomeStatements.Where(p => startDate <= p.FiscalDateEnding && p.FiscalDateEnding <= Date && stage2.Select(s => s.Ticker).Contains(p.Ticker))
                                                      .ToList();

        System.Console.WriteLine("Getting annual earnings data for the last 5 years...");
        startDate = Date.AddYears(-6);
        var annualEarnings = _context.AnnualEarnings.Where(p => startDate <= p.FiscalDateEnding && p.FiscalDateEnding <= Date && stage2.Select(s => s.Ticker).Contains(p.Ticker))
                                                    .ToList();

        System.Console.WriteLine("Getting latest balance sheet...");
        startDate = Date.AddMonths(-4); // Should be 3 months, but do 4 to be sure
        var balance = _context.QuarterlyBalanceSheets.Where(p => startDate <= p.FiscalDateEnding && p.FiscalDateEnding <= Date && stage2.Select(s => s.Ticker).Contains(p.Ticker))
                                                     .ToList();


        System.Console.WriteLine("Getting max drop of SPY in the last 5 years...");
        var maxDropSPY = prices.Where(t => t.Ticker == "SPY").OrderBy(p => p.Date).ToList().CalculateGreatestDropPercentage();
        System.Console.WriteLine("Max drop of SPY is {0}", maxDropSPY.Round());

        System.Console.WriteLine("Applying filters to historical data...");
        Tickers = [.. prices.GroupBy(g => g.Ticker).Select(g => new
        {
            Ticker = g.Key,
            SMA40 = (decimal)g.OrderBy(x => x.Date).GetSma(200).Last().Sma!,
            VolumeSMA50 = (decimal)g.Select(x => new TickerData() { Date = x.Date, Ticker = x.Ticker, Close = x.Volume }).OrderBy(x => x.Date).GetSma(50).Last().Sma!,
            MaxDrop = g.OrderBy(x => x.Date).ToList().CalculateGreatestDropPercentage(),
            PriceData = g.Last(),
            // We need 9 quarters: 8 will give us 4 quarters with yoy change and we need 1 more for the smoothing 
            Earnings = earnings.Where(e => e.Ticker == g.Key).OrderByDescending(e => e.FiscalDateEnding).Take(9).ToList().GetYearOverYearChange().Smooth(),
            AnnualEarnings = annualEarnings.Where(e => e.Ticker == g.Key).OrderByDescending(e => e.FiscalDateEnding).Take(6).ToList().GetYearOverYearChange().Smooth(),
            Sales = sales.Where(e => e.Ticker == g.Key).OrderByDescending(e => e.FiscalDateEnding).Take(9).ToList().GetYearOverYearChange().Smooth(),
            MarketCap = balance.Where(e => e.Ticker == g.Key).OrderByDescending(e => e.FiscalDateEnding).FirstOrDefault()?.MarketCap(g.Last().Close),
            SharesOutstanding = balance.Where(e => e.Ticker == g.Key).OrderByDescending(e => e.FiscalDateEnding).FirstOrDefault()?.SharesOutstanding,
        }).Where(p => p.SMA40 >= 5M &&                 // Ensure the stock is not 'penny'.
                      p.VolumeSMA50 >= 200000M &&      // Ensure there is enough volume.
                      p.Earnings.Count > 0 && p.Earnings.Take(4).All(e => e.smooth >= 0.2M) &&      // latest 4 quarters should have 20% yoy increase
                      p.MaxDrop <= maxDropSPY + 0.2M)
          .Select(st => new WatchlistTickerInfoModel()
          {
            Ticker = _context.Tickers.FirstOrDefault(x => x.Ticker == st.Ticker)!,
            PriceData = st.PriceData,
            Earnings = st.Earnings,
            AnnualEarnings = st.AnnualEarnings,
            Income = st.Sales,
            MarketCap = st.MarketCap,
            SharesOutstanding = st.SharesOutstanding,
          }).Where(x => x.Ticker != null && x.PriceData != null).OrderByDescending(x => x.PriceData.RelativeStrength)];
        System.Console.WriteLine("Finished");
    }
}


