using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace investing.Pages;

public class ValuationModel : PageModel
{
    private readonly ILogger<ValuationModel> _logger;
    private readonly ApplicationDbContext context;

    public ValuationModel(ILogger<ValuationModel> logger, ApplicationDbContext context)
    {
        _logger = logger;
        this.context = context;
    }

    public Valuation? Valuation { get; set; } = null;
    public decimal Terminal { get; set; } = 0;
    public bool ReadOnly { get; set; } = false;

    [BindProperty]
    public int? CompanyId { get; set; }
    public Company Company { get; set; }

    [BindProperty]
    public DDMValuationInput ValuationInput { get; set; }

    public async Task<IActionResult> OnGet(int? id = null, int? companyId = null)
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

        if(companyId == null)
            return RedirectToPage("Error");

        CompanyId = companyId;
        Company = await context.Companies.FindAsync(companyId);
        return Page();
    }

    public async Task<IActionResult> OnPostAsync(string report="")
    {
        var _ = OnPostPerformValuation(report);
        Valuation!.ValuationInput = ValuationInput;

        context.Valuations.Add(Valuation!);
        await context.SaveChangesAsync();

        return RedirectToPage("Valuation", new { id = Valuation!.Id });
    }

    public IActionResult OnPostPerformValuation(string report = "")
    {
        if(CompanyId == null)
            return RedirectToPage("Error");

        Valuation = new Valuation()
        {
            Date = DateTimeOffset.Now,
            Report = report,
            CompanyId = CompanyId.Value,
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

        // LatestEPS will be none in case of 0 high growth years. In that case we want the base EPS.
        // Similarly, the latest CCOE is 1, because we don't have any extra years.
        var latestEPS = Valuation.Data.Where(d => d.Characteristic == ValuationCharacteristic.EarningsPerShare)
                                      .MaxBy(d => d.Ordinal)?.Value ?? ValuationInput.BaseEPS;
        var latestCCOE = Valuation.Data.Where(d => d.Characteristic == ValuationCharacteristic.CumulativeCostOfEquity)
                                       .MaxBy(d => d.Ordinal)?.Value ?? 1;
        var firstPart = latestEPS * (1 + ValuationInput.StableEPSGrowth / 100) * ValuationInput.StablePayoutRatio * (1 - ValuationInput.DividendWitholdingTax / 100) / 100;
        var terminalValue = firstPart / (ValuationInput.StableReturnRate / 100 - ValuationInput.StableEPSGrowth / 100);
        var terminalValuePV = terminalValue / latestCCOE;

        Valuation.TerminalValuePV = terminalValuePV;
        Valuation.IntrinsicValue = terminalValuePV + Valuation.Data.Where(d => d.Characteristic == ValuationCharacteristic.PresentValue)
                                                                   .Sum(d => d.Value);

        return Partial("_ValuationDetails", Valuation);
    }
}
