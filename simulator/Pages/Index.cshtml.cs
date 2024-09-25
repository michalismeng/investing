using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using simulator.Extensions;
using simulator.Model;

namespace simulator.Pages;

public class IndexModel : PageModel
{
    private readonly ILogger<IndexModel> _logger;
    private readonly ApplicationDbContext _context;

    public IndexModel(ILogger<IndexModel> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public List<TickerInfo> Tickers { get; set; } = new List<TickerInfo>();
    public DateTime Date { get; set; }

    public void OnGet()
    {
        Date = new DateTime(2015, 02, 02);
        var startDate = Date.AddYears(-1).AddMonths(-1);
        var tickers = _context.Tickers.ToList();
        var prices = _context.PriceData.Where(p => p.Datetime <= Date && startDate <= p.Datetime)
                                       .ToList()
                                       .GroupBy(p => p.Ticker)
                                       .ToDictionary(g => g.Key, g => g.Select(p => p));
        foreach(var p in prices)
        {
            var sorted = p.Value.OrderBy(p => p.Datetime).ToList();
            var dates = sorted.GetStage2ForLastDay();
            if(dates.Contains(Date))
                Tickers.Add(tickers.Single(t => t.Ticker == p.Key));
        }
        // Tickers.AddRange(tickers);
        System.Console.WriteLine("Finished");
    }
}

