using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CsvHelper.Configuration.Attributes;
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

    [NotMapped]
    public DateTime Date => Datetime;

    [NotMapped]
    public TickerDataGranulariry Granularity { get; set; } = TickerDataGranulariry.Daily;

    public override string ToString()
    {
        return $"{Ticker}({Datetime.ToString("yyyy-MM-dd")}): Close at ${Close} with volume {Volume}";
    }
}

        class TickerDataCSV
        {
            public decimal Open { get; set; }
            public decimal Close { get; set; }
            public decimal Low { get; set; }
            public decimal High { get; set; }
            public decimal Volume { get; set; }
            [Name("Date")]
            public DateTime DateTime { get; set; }
            public decimal Dividends { get; set; }
            [Name("Stock Splits")]
            public decimal StockSplits { get; set; }
        
            public TickerData ToTickerData(string ticker, TickerDataGranulariry granularity = TickerDataGranulariry.Daily) => new TickerData()
            {
                Ticker = ticker,
                Close = Close,
                Datetime = DateTime,
                Granularity = granularity,
                High = High,
                Low = Low,
                Open = Open,
                Volume = Volume,
            };
        }
