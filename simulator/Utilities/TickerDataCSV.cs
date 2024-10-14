using CsvHelper.Configuration.Attributes;
using simulator.Model;

namespace simulator.Utilities;

public class TickerDataCSV
{
    public string? Ticker { get; set; }
    public decimal Open { get; set; }
    public decimal Close { get; set; }
    public decimal Low { get; set; }
    public decimal High { get; set; }
    public decimal Volume { get; set; }
    [Name("Date")]
    public DateTime Datetime { get; set; }
    public decimal Dividends { get; set; }
    [Name("Stock Splits")]
    public decimal StockSplits { get; set; }
        
    public TickerData ToTickerData(TickerDataGranulariry granularity = TickerDataGranulariry.Daily) => new()
    {
        Ticker = Ticker ?? "",
        Close = Close,
        Date = Datetime,
        Granularity = granularity,
        High = High,
        Low = Low,
        Open = Open,
        Volume = Volume,
    };
}