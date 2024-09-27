using Microsoft.AspNetCore.Mvc.RazorPages;
using Skender.Stock.Indicators;
using simulator.Model;
using simulator.Extensions;
using Microsoft.AspNetCore.Mvc;

namespace simulator.Pages;

public class RealtimeModel : PageModel
{
    private readonly ILogger<RealtimeModel> _logger;
    private readonly ApplicationDbContext _context;

    public RealtimeModel(ILogger<RealtimeModel> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public TickerInfo TickerInfo { get; set; }
    public List<TickerData> Records { get; set; } = [];
    public List<TickerData> SPY { get; set; } = [];
    public List<SmaResult> MA_10 { get; set; } = [];
    public List<SmaResult> MA_30 { get; set; } = [];
    public List<SmaResult> MA_40 { get; set; } = [];
    public List<TickerData> Week_High_52 { get; set; } = [];
    public List<TickerData> Week_Low_52 { get; set; } = [];
    public List<DateTime> Stage2_Marks { get; set; } = [];
    public DateTime CutoffDate { get; set; } = DateTime.Now;
    public DateTime StartDate { get; set; } = DateTime.Now;

    public void OnGet(string ticker = "AMZN", string? cutoff = null, int years=5)
    {
        CutoffDate = cutoff != null ? DateTime.Parse(cutoff) : DateTime.Now;
        StartDate = CutoffDate.AddYears(-years);

        TickerInfo = _context.Tickers.Single(d => d.Ticker == ticker);
        Records = _context.PriceData.Where(p => p.Ticker == TickerInfo.Ticker && StartDate <= p.Datetime && p.Datetime <= CutoffDate).ToList();
        SPY = _context.PriceData.Where(p => p.Ticker == "SPY" && StartDate <= p.Datetime && p.Datetime <= CutoffDate).ToList();

        MA_10 = Records.GetSma(50).Condense().ToList();
        MA_30 = Records.GetSma(150).Condense().ToList();
        MA_40 = Records.GetSma(200).Condense().ToList();
        Week_High_52 = Records.Calculate52WeekHigh();
        Week_Low_52 = Records.Calculate52WeekLow();
        Stage2_Marks = Records.GetStage2();
    }

    public IActionResult OnGetPrice(string ticker, DateTime date)
    {
        var startDate = date.AddYears(-1).AddMonths(-1);
        var price = _context.PriceData.Where(p => startDate <= p.Datetime && p.Datetime <= date && p.Ticker == ticker).OrderBy(p => p.Datetime).ToList();
        var spy = _context.PriceData.SingleOrDefault(p => p.Datetime == date && p.Ticker == "SPY");

        if (price.Any(p => p.Datetime == date) == false)
            return new OkObjectResult(null);

        return new OkObjectResult(new {
            Price = price.Last(),
            Ma10 = price.GetSma(50).Condense().ToList().Last(),
            Ma30 = price.GetSma(150).Condense().ToList().Last(),
            Ma40 = price.GetSma(200).Condense().ToList().Last(),
            Week52High = price.Calculate52WeekHigh().Last(),
            Week52Low = price.Calculate52WeekLow().Last(),
            IsStage2 = price.IsLastDayStage2(),
            Spy = spy,
        });
    }
}
