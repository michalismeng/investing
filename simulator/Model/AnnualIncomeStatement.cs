using System.ComponentModel.DataAnnotations;

public class AnnualIncomeStatement
{
    [Required]
    public required string Ticker { get; set; }
    public DateTime FiscalDateEnding { get; set; }
    public string ReportedCurrency { get; set; }
    public decimal? TotalRevenue { get; set; }

    public override string ToString()
    {
        return $"{Ticker}({FiscalDateEnding:yyyy-MM-dd}): {ReportedCurrency} {TotalRevenue}";
    }
}

