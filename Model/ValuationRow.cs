using System.Reflection.PortableExecutable;
using Microsoft.EntityFrameworkCore;

public enum ValuationCharacteristic
{
    ExpectedGrowthRate,
    EarningsPerShare,
    PayoutRatio,
    DividendsPerShare,
    CostOfEquity,
    CumulativeCostOfEquity,
    PresentValue,
}

public enum DisplayFormat
{
    Percent,
    Currency,
}

public record ValuationDescriptor(ValuationCharacteristic Characteristic, DisplayFormat DisplayFormat);

public static class ValuationDescriptors
{
    public static List<ValuationDescriptor> DDMValuationDescriptors =
    [
        new(ValuationCharacteristic.ExpectedGrowthRate, DisplayFormat.Percent),
        new(ValuationCharacteristic.EarningsPerShare, DisplayFormat.Currency),
        new(ValuationCharacteristic.PayoutRatio, DisplayFormat.Percent),
        new(ValuationCharacteristic.DividendsPerShare, DisplayFormat.Currency),
        new(ValuationCharacteristic.CostOfEquity, DisplayFormat.Percent),
    ];
}

public class ValuationData
{
    public int Id { get; set; }
    public int ValuationId { get; set; }
    public ValuationCharacteristic Characteristic { get; set; }
    public int Ordinal { get; set; }
    public decimal Value { get; set; }
    public Valuation Valuation { get; set; }
}

public class Valuation
{
    public int Id { get; set; }
    public DateTimeOffset Date { get; set; }
    public string Report { get; set; }
    public ICollection<ValuationData> Data { get; set; }

    // public static Valuation Default() => new()
    // {
    //     Descriptors = [
    //         new ValuationDescriptor()
    //         {
    //             Text = "Expected Growth Rate",
    //             DisplayFormat = DisplayFormat.Percent,
    //             Data = [
    //                 new ValuationData() { Ordinal = 0, Value = 10},
    //                 new ValuationData() { Ordinal = 1, Value = 10},
    //                 new ValuationData() { Ordinal = 2, Value = 10},
    //                 new ValuationData() { Ordinal = 3, Value = 10},
    //             ]
    //         },
    //         new ValuationDescriptor()
    //         {
    //             Text = "Earnings per share",
    //             DisplayFormat = DisplayFormat.Currency,
    //             Data = [
    //                 new ValuationData() { Ordinal = 0, Value = 10},
    //                 new ValuationData() { Ordinal = 1, Value = 10},
    //                 new ValuationData() { Ordinal = 2, Value = 10},
    //                 new ValuationData() { Ordinal = 3, Value = 10},
    //             ]
    //         },
    //         new ValuationDescriptor()
    //         {
    //             Text = "Payout ratio",
    //             DisplayFormat = DisplayFormat.Percent,
    //             Data = [
    //                 new ValuationData() { Ordinal = 0, Value = 10},
    //                 new ValuationData() { Ordinal = 1, Value = 10},
    //                 new ValuationData() { Ordinal = 2, Value = 10},
    //                 new ValuationData() { Ordinal = 3, Value = 10},
    //             ]
    //         }
    //     ],
    // };
}

public static class Initializer
{
    public static void Initialize(ApplicationDbContext context)
    {
        context.Database.EnsureCreated();
        context.RemoveRange(context.Valuations);
        context.SaveChanges();
        if(context.Valuations.Any())
            return;

        var v = Enumerable.Range(0, 11).SelectMany(x => Enumerable.Range(0, 5).Select(y => (x, y))).Select(x => new ValuationData
        {
            Characteristic = (ValuationCharacteristic)x.y,
            Ordinal = x.x,
            Value = x.x
        });


        var valuation = new Valuation()
        {
            Date = DateTimeOffset.Now,
            Report = "FY24Q2",
            Data = v.ToList(),
        };

        context.Valuations.Add(valuation);
        context.SaveChanges();
    }
}