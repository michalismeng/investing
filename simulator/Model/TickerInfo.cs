using System.ComponentModel.DataAnnotations;

public class TickerInfo
{
    [Required]
    public required string Ticker { get; set; }
    public string? Name { get; set; }
    public string? Industry { get; set; }
    public string? Sector { get; set; }
    public decimal MarketCap { get; set; }

    public DateTime DateCreated { get; set; }
    public DateTime DateUpdated { get; set; }

    public override string ToString()
    {
        if (Sector != "n/a")
            return $"{Name} ({Ticker}) - {Sector}/{Industry}";
        else
            return $"{Name} ({Ticker})";
    }
}
