using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Skender.Stock.Indicators;

namespace simulator.Model;

public enum TickerDataGranulariry
{
    Daily,
    Weekly,
}

public class TickerData : IQuote
{
    [Required]
    public required string Ticker { get; set; }
    [Required]
    public DateTime Date { get; set; }
    public decimal Open { get; set; }
    public decimal Close { get; set; }
    public decimal High { get; set; }
    public decimal Low { get; set; }
    public decimal Volume { get; set; }
    public decimal? Strength { get; set; }
    public decimal? RelativeStrength { get; set; }
    public string? ReferenceTicker { get; set; }
    public int? Percentile { get; set; }
    /// <summary>
    /// Whether the stock is in stage 2 for this day.
    /// If null, then the calculation hasn't happened yet.
    /// </summary>
    public bool? IsStage2 { get; set; }

    [NotMapped]
    public TickerDataGranulariry Granularity { get; set; } = TickerDataGranulariry.Daily;

    public override string ToString()
    {
        return $"{Ticker}({Date:yyyy-MM-dd}): Close at ${Close} with volume {Volume}";
    }
}
