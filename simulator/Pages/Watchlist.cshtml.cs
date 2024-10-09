using System.Collections.Concurrent;
using System.Runtime.InteropServices;
using Microsoft.AspNetCore.Mvc.RazorPages;
using simulator.Extensions;
using simulator.Model;

namespace simulator.Pages;

public class WatchlistTickerInfoModel
{
    public TickerInfo Ticker { get; set; }
    public int Percentile { get; set; }
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
        Date = date != null ? DateTime.Parse(date) : DateTime.Today;
        var startDate = Date.AddYears(-1).AddMonths(-1);
        var tickers = _context.Tickers.ToDictionary(g => g.Ticker);
        var prices = _context.PriceData.Where(p => p.Datetime <= Date && startDate <= p.Datetime)
                                       .GroupBy(p => p.Ticker)
                                       .ToDictionary(g => g.Key, g => g.Select(p => p));

        foreach(var p in prices)
        {
            var sorted = p.Value.OrderBy(p => p.Datetime).ToList();
            if(sorted.IsLastDayStage2())
                Tickers.Add(new WatchlistTickerInfoModel() { Ticker = tickers[p.Key], Percentile = sorted.Last().Percentile.Value });
        }

        Tickers = [.. Tickers.OrderByDescending(t => t.Percentile)];
    }
}


