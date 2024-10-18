using System.ComponentModel.DataAnnotations;

public class QuarterlyIncomeStatement
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

