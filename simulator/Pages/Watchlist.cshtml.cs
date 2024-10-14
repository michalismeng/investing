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
}

public class WatchlistModel : PageModel
{
    private readonly ILogger<IndexModel> _logger;
    private readonly ApplicationDbContext _context;
    private readonly DorisDbContext doris;

    public WatchlistModel(ILogger<IndexModel> logger, ApplicationDbContext context, DorisDbContext doris)
    {
        _logger = logger;
        _context = context;
        this.doris = doris;
    }

    public List<WatchlistTickerInfoModel> Tickers { get; set; } = [];
    public DateTime Date { get; set; }

    public void OnGet(string? date = null)
    {
        Date = date != null ? DateTime.Parse(date) : DateTime.Today.AddDays(-1);

        System.Console.WriteLine("Getting stage 2 companies...");
        var stage2 = _context.PriceData.Where(p => p.Datetime == Date && p.IsStage2 == true)
                                       .ToList();

        var startDate = Date.AddYears(-5);
        System.Console.WriteLine("Getting price data for 5 years...");
        var stage2Tickers = stage2.Select(s => s.Ticker).ToList();
        var prices = doris.PriceData.Where(p => startDate <= p.Datetime && p.Datetime <= Date && stage2Tickers.Contains(p.Ticker))
                                    .ToList();

        System.Console.WriteLine("Applying filters to historical data...");
        Tickers = [.. prices.GroupBy(g => g.Ticker).Select(g => new
        {
            Ticker = g.Key,
            SMA40 = (decimal)g.OrderBy(x => x.Datetime).GetSma(200).Last().Sma!,
            VolumeSMA50 = (decimal)g.Select(x => new TickerData() { Datetime = x.Datetime, Ticker = x.Ticker, Close = x.Volume }).OrderBy(x => x.Datetime).GetSma(50).Last().Sma!,
            MaxDrop = g.OrderBy(x => x.Datetime).ToList().CalculateGreatestDropPercentage(),
            PriceData = g.Last(),
        }).Where(p => p.SMA40 >= 5M &&                 // Ensure the stock is not 'penny'.
                      p.VolumeSMA50 >= 200000M &&      // Ensure there is enough volume.
                      p.MaxDrop <= 0.5M)
          .Select(st => new WatchlistTickerInfoModel()
          {
            Ticker = _context.Tickers.FirstOrDefault(x => x.Ticker == st.Ticker)!,
            PriceData = st.PriceData,
          }).Where(x => x.Ticker != null && x.PriceData != null).OrderByDescending(x => x.PriceData.RelativeStrength)];
        System.Console.WriteLine("Finished");
    }
}


