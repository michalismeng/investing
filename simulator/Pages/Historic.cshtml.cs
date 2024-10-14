using Microsoft.AspNetCore.Mvc.RazorPages;
using Skender.Stock.Indicators;
using simulator.Model;
using simulator.Extensions;
using Microsoft.EntityFrameworkCore;

namespace simulator.Pages;

public class HistoricModel : PageModel
{
    private readonly ILogger<HistoricModel> _logger;
    private readonly ApplicationDbContext _context;

    public HistoricModel(ILogger<HistoricModel> logger, ApplicationDbContext context)
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

    public void OnGet(string? dateStart = null, string? dateEnd = null)
    {
        TickerInfo = _context.Tickers.Single(d => d.Ticker == "AMZN");
        var records = _context.PriceData.Where(d => d.Ticker == TickerInfo.Ticker).ToList().ToWeekly();
        Records = records;

        records = _context.PriceData.Where(d => d.Ticker == "SPY").ToList().ToWeekly();
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

        MA_10 = Records.GetSma(50).Condense().ToList();
        MA_30 = Records.GetSma(150).Condense().ToList();
        MA_40 = Records.GetSma(200).Condense().ToList();
        Week_High_52 = Records.Calculate52WeekHigh();
        Week_Low_52 = Records.Calculate52WeekLow();
        Stage2_Marks = Records.GetStage2();
    }
}
