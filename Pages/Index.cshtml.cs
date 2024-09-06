using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;

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

    public List<Company> Companies { get; set; } = [];

    public async Task OnGet()
    {
        Companies = await context.Companies.Include(v => v.Valuations).ToListAsync();
    }

    public async Task<IActionResult> OnPostAddCompanyAsync(string company)
    {
        context.Companies.Add(new Company()
        {
            Name = company,
        });
        await context.SaveChangesAsync();
        return RedirectToPage();
    }
}
