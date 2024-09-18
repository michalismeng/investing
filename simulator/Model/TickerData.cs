using System.ComponentModel.DataAnnotations;
using Skender.Stock.Indicators;

public class TickerData : IQuote
{
    [Required]
    public required string Ticker { get; set; }
    [Required]
    public DateTime Datetime { get; set; }
    public decimal Open { get; set; }
    public decimal Close { get; set; }
    public decimal High { get; set; }
    public decimal Low { get; set; }
    public decimal Volume { get; set; }
    public decimal? Strength { get; set; }
    public decimal? RelativeStrength { get; set; }
    public string? ReferenceTicker { get; set; }
    public int? Percentile { get; set; }

    public DateTime Date => Datetime;

    public override string ToString()
    {
        return $"{Ticker}({Datetime.ToString("yyyy-MM-dd")}): Close at ${Close} with volume {Volume}";
    }
}