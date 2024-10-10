using System.Collections.Concurrent;
using System.Runtime.InteropServices;
using Microsoft.AspNetCore.Mvc.RazorPages;
using simulator.Extensions;
using simulator.Model;

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
        var prices = _context.PriceData.Where(p => p.Datetime == Date && p.IsStage2 == true)
                                       .ToDictionary(g => g.Ticker);

        Tickers = [.. prices.Select(st => new WatchlistTickerInfoModel()
        {
            Ticker = _context.Tickers.FirstOrDefault(x => x.Ticker == st.Key),
            PriceData = st.Value,
        }).Where(x => x.Ticker != null && x.PriceData != null).OrderByDescending(x => x.PriceData.RelativeStrength)];
    }
}


