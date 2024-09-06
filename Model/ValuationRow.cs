using System.Text.RegularExpressions;

public enum ValuationCharacteristic
{
    ExpectedGrowthRate,
    EarningsPerShare,
    PayoutRatio,
    DividendsPerShare,
    NetDividendsPerShare,
    CostOfEquity,
    CumulativeCostOfEquity,
    PresentValue,
}

public enum DisplayFormat
{
    None,
    Percent,
    Currency,
}

public record ValuationDescriptor(ValuationCharacteristic Characteristic, DisplayFormat DisplayFormat);

public static class ValuationDescriptors
{
    public static readonly List<ValuationDescriptor> DDMValuationDescriptors =
    [
        new(ValuationCharacteristic.ExpectedGrowthRate, DisplayFormat.Percent),
        new(ValuationCharacteristic.EarningsPerShare, DisplayFormat.Currency),
        new(ValuationCharacteristic.PayoutRatio, DisplayFormat.Percent),
        new(ValuationCharacteristic.DividendsPerShare, DisplayFormat.Currency),
        new(ValuationCharacteristic.NetDividendsPerShare, DisplayFormat.Currency),
        new(ValuationCharacteristic.CostOfEquity, DisplayFormat.Percent),
        new(ValuationCharacteristic.CumulativeCostOfEquity, DisplayFormat.Percent),
        new(ValuationCharacteristic.PresentValue, DisplayFormat.Currency),
    ];
}

public class Company
{
    public int Id { get; set; }
    public string Name { get; set; }
    public List<Valuation> Valuations { get; set; }
}

public class ValuationData
{
    public int Id { get; set; }
    public int ValuationId { get; set; }
    public ValuationCharacteristic Characteristic { get; set; }
    public int Ordinal { get; set; }
    public decimal Value { get; set; }
    public Valuation Valuation { get; set; } = new Valuation();
}

public class Valuation
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public DateTimeOffset Date { get; set; }
    public string Report { get; set; } = "N/A";
    public List<ValuationData> Data { get; set; } = [];
    public decimal TerminalValuePV { get; set; }
    public decimal IntrinsicValue { get; set; }

    public DDMValuationInput ValuationInput { get; set; }
    public Company Company { get; set; }
}

public class DDMValuationInput
{
    public int Id { get; set; }

    public int? ValuationId { get; set; }
    public Valuation? Valuation { get; set; }

    public decimal DividendWitholdingTax { get; set; }

    public decimal BaseEPS { get; set; }
    public bool GraduallyAdjust { get; set; }

    public decimal EpsGrowth { get; set; }
    public decimal PayoutRatio { get; set; }
    public decimal ReturnRate { get; set; }

    public int GrowthYears { get; set; }

    public decimal StableEPSGrowth { get; set; }
    public decimal StablePayoutRatio { get; set; }
    public decimal StableReturnRate { get; set; }
}

public static class CharacteristicExtensions
{
    public static string ToFriendly(this ValuationCharacteristic characteristic) =>
        string.Join(" ", Regex.Split(characteristic.ToString(), @"(?<!^)(?=[A-Z])"));
}

public static class ValuationExtensions
{
    public static Valuation InitializePayoutRatioData(this Valuation valuation, decimal payout, decimal payoutStable, int stableSteps, int lerpSteps)
    {
        valuation.Data.AddRange([
            ..((decimal[])[..payout.Stable(stableSteps),
                           ..(payout, payoutStable).Lerp(lerpSteps)])
                .ToValuationData(ValuationCharacteristic.PayoutRatio, valuation.Id),
        ]);
        return valuation;
    }

    public static Valuation InitializeReturnRateData(this Valuation valuation, decimal returnRate, decimal stableReturnRate, int stableSteps, int lerpSteps)
    {
        valuation.Data.AddRange([
            ..((decimal[])[..returnRate.Stable(stableSteps),
                           ..(returnRate, stableReturnRate).Lerp(lerpSteps)])
                .ToValuationData(ValuationCharacteristic.CostOfEquity, valuation.Id),
        ]);
        return valuation;
    }

    public static Valuation InitializeEPSGrowthData(this Valuation valuation, decimal epsGrowth, decimal stableEpsGrowth, int stableSteps, int lerpSteps)
    {
        valuation.Data.AddRange([
            ..((decimal[])[..epsGrowth.Stable(stableSteps),
                           ..(epsGrowth, stableEpsGrowth).Lerp(lerpSteps)])
                .ToValuationData(ValuationCharacteristic.ExpectedGrowthRate, valuation.Id),
        ]);
        return valuation;
    }

    public static Valuation CalculateEarningsPerShare(this Valuation valuation, decimal baseEPS)
    {
        var data = valuation.Data;
        var growthRates = data.Where(d => d.Characteristic == ValuationCharacteristic.ExpectedGrowthRate);

        var eps = growthRates.Aggregate(new List<decimal>() { baseEPS }, (acc, g) => [..acc, acc.Last() * (1 + g.Value)])
                             .Skip(1)
                             .ToValuationData(ValuationCharacteristic.EarningsPerShare, valuation.Id)
                             .ToList();

        data.AddRange(eps);
        return valuation;
    }

    public static Valuation CalculateDividendsPerShare(this Valuation valuation)
    {
        var data = valuation.Data;
        var eps = data.Where(d => d.Characteristic == ValuationCharacteristic.EarningsPerShare);
        var payoutRatios = data.Where(d => d.Characteristic == ValuationCharacteristic.PayoutRatio);

        var dps = eps.OrderBy(v => v.Ordinal).Zip(payoutRatios.OrderBy(v => v.Ordinal))
                     .Select(x => x.First.Value * x.Second.Value)
                     .ToValuationData(ValuationCharacteristic.DividendsPerShare, valuation.Id).ToList();

        data.AddRange(dps);
        return valuation;
    }

    public static Valuation ApplyWithholdingTax(this Valuation valuation, decimal withholdingTax)
    {
        var data = valuation.Data;
        var dividends = data.Where(d => d.Characteristic == ValuationCharacteristic.DividendsPerShare);
        var netDividends = dividends.Select(d => d.Value * (1 - withholdingTax))
                                    .ToValuationData(ValuationCharacteristic.NetDividendsPerShare, valuation.Id)
                                    .ToList();
        data.AddRange(netDividends);
        return valuation;
    }

    public static Valuation CalculateCumulativeCostOfEquity(this Valuation valuation)
    {
        var data = valuation.Data;
        var costOfEquity = data.Where(d => d.Characteristic == ValuationCharacteristic.CostOfEquity);

        var ccoe = costOfEquity.Aggregate(new List<decimal>() { 1 }, (acc, g) => [..acc, acc.Last() * (1 + g.Value)])
                               .Skip(1)
                               .ToValuationData(ValuationCharacteristic.CumulativeCostOfEquity, valuation.Id)
                               .ToList();

        data.AddRange(ccoe);
        return valuation;
    }

    public static Valuation CalculatePresentValue(this Valuation valuation, ValuationCharacteristic cashflowCharacteristic)
    {
        var data = valuation.Data;
        var ccoe = data.Where(d => d.Characteristic == ValuationCharacteristic.CumulativeCostOfEquity);
        var cashflow = data.Where(d => d.Characteristic == cashflowCharacteristic);

        var pvs = cashflow.OrderBy(c => c.Ordinal).Zip(ccoe.OrderBy(v => v.Ordinal))
                          .Select(x => x.First.Value / x.Second.Value)
                          .ToValuationData(ValuationCharacteristic.PresentValue, valuation.Id)
                          .ToList();
        data.AddRange(pvs);
        return valuation;
    }

    // public static Valuation CalculateDDMTerminalValue(this Valuation valuation, decimal dividentWHT)
    // {
    // }

    public static IEnumerable<ValuationData> ToValuationData(this IEnumerable<decimal> values, ValuationCharacteristic characteristic, int valuationId = 0) =>
        values.Select((v, i) => new ValuationData()
        {
            Characteristic = characteristic,
            Ordinal = i,
            Value = v,
            ValuationId = valuationId,
        });

    public static IEnumerable<decimal> Stable(this decimal value, int steps) =>
        Enumerable.Range(1, steps).Select(_ => value);

    public static IEnumerable<decimal> Lerp(this decimal start, decimal end, int steps) =>
        Enumerable.Range(1, steps).Select(s => start - (start - end) / steps * s);
    
    public static IEnumerable<decimal> Lerp(this (decimal start, decimal end) x, int steps) =>
        x.start.Lerp(x.end, steps);
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

        var v = Enumerable.Range(1, 10).Select(x => new ValuationData()
        {
            Characteristic = ValuationCharacteristic.ExpectedGrowthRate,
            Ordinal = x,
            Value = 0.0859M,
        }).ToList();

        v.AddRange(Enumerable.Range(1, 10).Select(x => new ValuationData()
        {
            Characteristic = ValuationCharacteristic.PayoutRatio,
            Ordinal = x,
            Value = 0.4716M,
        }));

        v.AddRange(Enumerable.Range(1, 10).Select(x => new ValuationData()
        {
            Characteristic = ValuationCharacteristic.CostOfEquity,
            Ordinal = x,
            Value = 0.051M,
        }));

        var valuation = new Valuation()
        {
            Date = DateTimeOffset.Now,
            Report = "FY24Q2",
            Data = v,
        };

        context.Valuations.Add(valuation);
        context.SaveChanges();
    }
}