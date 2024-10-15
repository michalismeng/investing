using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class AnnualEarningsEntry
{
    [Required]
    public required string Ticker { get; set; }
    public DateTime FiscalDateEnding { get; set; }
    public decimal? ReportedEPS { get; set; }

    public override string ToString()
    {
        return $"{Ticker}({FiscalDateEnding:yyyy-MM-dd}): ${ReportedEPS}";
    }
}


