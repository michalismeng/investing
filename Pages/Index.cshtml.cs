using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace investing.Pages;

public class IndexModel : PageModel
{
    private readonly ILogger<IndexModel> _logger;
    private readonly ApplicationDbContext context;

    public IndexModel(ILogger<IndexModel> logger, ApplicationDbContext context)
    {
        _logger = logger;
        this.context = context;
    }

    public Valuation? Valuation { get; set; } = null;

    [BindProperty]
    public DDMValuationInput ValuationInput { get; set; }

    public async Task OnGet(int? id = null)
    {
        if (id != null)
        {
            Valuation = await context.Valuations.Include(v => v.Data)
                                                .SingleAsync(v => v.Id == id);
        }

        ValuationInput = new DDMValuationInput()
        {
            GrowthYears = 10,
            BaseEPS = 2.29M,
            EpsGrowth = 8.59M,
            PayoutRatio = 47.16M,
            ReturnRate = 5.1M,
            StableEPSGrowth = 0.5M,
            StablePayoutRatio = 66.67M,
            StableReturnRate = 9M,
        };
    }

    public async Task<IActionResult> OnPostPerformValuationAsync(string report)
    {
        var data = new List<ValuationData>();
        data.AddRange([
            ..Enumerable.Range(1, ValuationInput.GrowthYears)
                        .Select(_ => ValuationInput.EpsGrowth / 100)
                        .ToValuationData(ValuationCharacteristic.ExpectedGrowthRate),
            ..Enumerable.Range(1, ValuationInput.GrowthYears)
                        .Select(_ => ValuationInput.PayoutRatio / 100)
                        .ToValuationData(ValuationCharacteristic.PayoutRatio),
            ..Enumerable.Range(1, ValuationInput.GrowthYears)
                        .Select(_ => ValuationInput.ReturnRate / 100)
                        .ToValuationData(ValuationCharacteristic.CostOfEquity)
        ]);

        Valuation = new Valuation()
        {
            Data = data,
            Date = DateTimeOffset.Now,
            Report = report,
        };

        Valuation.CalculateEarningsPerShare(ValuationInput.BaseEPS)
                 .CalculateDividendsPerShare()
                 .CalculateCumulativeCostOfEquity()
                 .CalculatePresentValue(ValuationCharacteristic.DividendsPerShare);

        context.Valuations.Add(Valuation);
        await context.SaveChangesAsync();

        return RedirectToPage("Index", new { id = Valuation.Id });
    }
}
