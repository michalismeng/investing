using System.ComponentModel.DataAnnotations;

public class TickerData
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

    public TickerInfo? TickerInfo { get; set; }

    public override string ToString()
    {
        return $"{Ticker}({Datetime.ToString("yyyy-MM-dd")}): Close at ${Close} with volume {Volume}";
    }
}