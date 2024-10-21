using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class QuarterlyEarningsEntry
{
    [Required]
    public required string Ticker { get; set; }
    public DateTime FiscalDateEnding { get; set; }
    public DateTime ReportedDate { get; set; }
    public decimal? ReportedEPS { get; set; }
    public decimal? Surpirse { get; set; }

    [NotMapped]
    public decimal? EstimatedEPS  => ReportedEPS - Surpirse;
    [NotMapped]
    public decimal? SurprisePercentage  => EstimatedEPS.HasValue && EstimatedEPS.Value != 0 ? Surpirse / Math.Abs(EstimatedEPS.Value) : null;

    public override string ToString()
    {
        return $"{Ticker}({FiscalDateEnding:yyyy-MM-dd}): ${ReportedEPS}";
    }
}

