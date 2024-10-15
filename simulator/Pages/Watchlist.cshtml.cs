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
    public List<(QuarterlyEarningsEntry entry, decimal? change)> Earnings { get; set; }
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
        var prices = _context.PriceData.Where(p => startDate <= p.Date && p.Date <= Date && stage2.Select(s => s.Ticker).Contains(p.Ticker))
                                       .ToList();
        
        System.Console.WriteLine("Getting quarterly earnings data for the last 4 + 4 quarters...");
        startDate = Date.AddYears(-4);
        var earnings = _context.QuarterlyEarnings.Where(p => startDate <= p.FiscalDateEnding && p.FiscalDateEnding <= Date && stage2.Select(s => s.Ticker).Contains(p.Ticker))
                                                 .ToList();
        
        System.Console.WriteLine("Applying filters to historical data...");
        Tickers = [.. prices.GroupBy(g => g.Ticker).Select(g => new
        {
            Ticker = g.Key,
            SMA40 = (decimal)g.OrderBy(x => x.Date).GetSma(200).Last().Sma!,
            VolumeSMA50 = (decimal)g.Select(x => new TickerData() { Date = x.Date, Ticker = x.Ticker, Close = x.Volume }).OrderBy(x => x.Date).GetSma(50).Last().Sma!,
            MaxDrop = g.OrderBy(x => x.Date).ToList().CalculateGreatestDropPercentage(),
            PriceData = g.Last(),
            Earnings = earnings.Where(e => e.Ticker == g.Key).OrderByDescending(e => e.FiscalDateEnding).Take(8).ToList().GetYearOverYearChange(),
        }).Where(p => p.SMA40 >= 5M &&                 // Ensure the stock is not 'penny'.
                      p.VolumeSMA50 >= 200000M &&      // Ensure there is enough volume.
                      p.MaxDrop <= 0.5M)
          .Select(st => new WatchlistTickerInfoModel()
          {
            Ticker = _context.Tickers.FirstOrDefault(x => x.Ticker == st.Ticker)!,
            PriceData = st.PriceData,
            Earnings = st.Earnings,
          }).Where(x => x.Ticker != null && x.PriceData != null).OrderByDescending(x => x.PriceData.RelativeStrength)];
        System.Console.WriteLine("Finished");
    }
}


