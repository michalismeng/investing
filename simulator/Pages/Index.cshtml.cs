using Microsoft.AspNetCore.Mvc.RazorPages;
using Skender.Stock.Indicators;
using simulator.Model;
using simulator.Extensions;

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

    public List<TickerData> Records { get; set; } = [];
    public List<TickerData> SPY { get; set; } = [];
    public List<SmaResult> MA_10 { get; set; } = [];
    public List<SmaResult> MA_30 { get; set; } = [];
    public List<SmaResult> MA_40 { get; set; } = [];
    public List<TickerData> Week_High_52 { get; set; } = [];
    public List<TickerData> Week_Low_52 { get; set; } = [];
    public List<DateTime> Stage2_Marks { get; set; } = [];

    public void OnGet(string? dateStart = null, string? dateEnd = null)
    {
        var records = _context.PriceData.Where(d => d.Ticker == "AMZN").ToList().ToWeekly();
        Records = records;

        records = _context.PriceData.Where(d => d.Ticker == "SPY").ToList().ToWeekly();
        SPY = records;

        if (dateStart != null)
        {
            var startDate = DateTime.Parse(dateStart);
            Records = Records.Where(p => p.Datetime >= startDate).ToList();
        }

        if (dateEnd != null)
        {
            var endDate = DateTime.Parse(dateEnd);
            Records = Records.Where(p => p.Datetime <= endDate).ToList();
        }

        MA_10 = Records.GetSma(10).Condense().ToList();
        MA_30 = Records.GetSma(30).Condense().ToList();
        MA_40 = Records.GetSma(40).Condense().ToList();
        Week_High_52 = Records.Calculate52WeekHigh();
        Week_Low_52 = Records.Calculate52WeekLow();
        Stage2_Marks = Records.GetStage2Weekly();
    }
}
