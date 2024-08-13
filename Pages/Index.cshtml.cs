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

    public Valuation Valuation { get; set; }

    public void OnGet()
    {
        Valuation = context.Valuations.Include(v => v.Data).First();
        Valuation.CalculateEarningsPerShare(2.29M)
                 .CalculateDividendsPerShare()
                 .CalculateCumulativeCostOfEquity()
                 .CalculatePresentValue(ValuationCharacteristic.DividendsPerShare);
    }
}
