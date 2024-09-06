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
    public decimal Terminal { get; set; } = 0;
    public bool ReadOnly { get; set; } = false;

    [BindProperty]
    public DDMValuationInput ValuationInput { get; set; }

    public async Task OnGet(int? id = null)
    {
        if (id != null)
        {
            Valuation = await context.Valuations.Include(v => v.Data)
                                                .Include(v => v.ValuationInput)
                                                .SingleAsync(v => v.Id == id);
            ReadOnly = true;
            ValuationInput = Valuation.ValuationInput;
        }
        else
        {
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
    }

    public async Task<IActionResult> OnPostAsync(string report="")
    {
        var _ = OnPostPerformValuation(report);
        Valuation!.ValuationInput = ValuationInput;

        context.Valuations.Add(Valuation!);
        await context.SaveChangesAsync();

        return RedirectToPage("Index", new { id = Valuation!.Id });
    }

    public IActionResult OnPostPerformValuation(string report = "")
    {
        Valuation = new Valuation()
        {
            Date = DateTimeOffset.Now,
            Report = report,
        };

        var lerpSteps = ValuationInput.GraduallyAdjust ? ValuationInput.GrowthYears / 2 : 0;
        var stableSteps = ValuationInput.GrowthYears - lerpSteps;

        Valuation.InitializeEPSGrowthData(ValuationInput.EpsGrowth / 100, ValuationInput.StableEPSGrowth / 100, stableSteps, lerpSteps);
        Valuation.InitializePayoutRatioData(ValuationInput.PayoutRatio / 100, ValuationInput.StablePayoutRatio / 100, stableSteps, lerpSteps);
        Valuation.InitializeReturnRateData(ValuationInput.ReturnRate / 100, ValuationInput.StableReturnRate / 100, stableSteps, lerpSteps);

        Valuation.CalculateEarningsPerShare(ValuationInput.BaseEPS)
                 .CalculateDividendsPerShare()
                 .ApplyWithholdingTax(ValuationInput.DividendWitholdingTax / 100)
                 .CalculateCumulativeCostOfEquity()
                 .CalculatePresentValue(ValuationCharacteristic.NetDividendsPerShare);

        var latestEPS = Valuation.Data.Where(d => d.Characteristic == ValuationCharacteristic.EarningsPerShare)
                                      .MaxBy(d => d.Ordinal);
        var latestCCOE = Valuation.Data.Where(d => d.Characteristic == ValuationCharacteristic.CumulativeCostOfEquity)
                                       .MaxBy(d => d.Ordinal);
        var firstPart = latestEPS!.Value * (1 + ValuationInput.StableEPSGrowth / 100) * ValuationInput.StablePayoutRatio * (1 - ValuationInput.DividendWitholdingTax / 100) / 100;
        var terminalValue = firstPart / (ValuationInput.StableReturnRate / 100 - ValuationInput.StableEPSGrowth / 100);
        var terminalValuePV = terminalValue / latestCCOE!.Value;

        Valuation.TerminalValuePV = terminalValuePV;
        Valuation.IntrinsicValue = terminalValuePV + Valuation.Data.Where(d => d.Characteristic == ValuationCharacteristic.PresentValue)
                                                                   .Sum(d => d.Value);

        return Partial("_ValuationDetails", Valuation);
    }
}
