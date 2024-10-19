using System.ComponentModel.DataAnnotations;

public class QuarterlyBalanceSheet
{
    [Required]
    public required string Ticker { get; set; }
    public DateTime FiscalDateEnding { get; set; }
    public string ReportedCurrency { get; set; } = "";
    public decimal? SharesOutstanding { get; set; }

    public decimal? MarketCap(decimal price) => SharesOutstanding * price;
}


