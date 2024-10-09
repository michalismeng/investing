using Microsoft.EntityFrameworkCore;
using simulator.Extensions;
using simulator.Model;
using System.Linq.Expressions;
using System.Net.Http.Headers;


namespace simulator.Utilities;

public static partial class Utilities
{
    /// <summary>
    /// Calculate strength of the given data array in place. Assume the data are ordered by datetime!
    /// If stopDate is given, then stop the calculation at that day (the calculation happens for that day)
    /// </summary>
    /// <param name="data">The array of ticker prices</param>
    /// <param name="stopDate">The date to stop the calculation</param>
    public static void CalculateStrength(TickerData[] data, DateTime? stopDate = null)
    {
        foreach(var i in Enumerable.Range(0, data.Length))
        {
            // Get strength of i-th last date
            var dataFiltered = data.AsSpan(0, data.Length - i);

            try
            {
                var strength = dataFiltered.GetStrength();
                var latest = dataFiltered[^1];
                if(stopDate.HasValue && latest.Datetime >= stopDate)
                    latest.Strength = strength;
            }
            catch(Exception ex)
            {
                // This exception means there aren't enough past data from the i-th entry to calculate the strength (we need 4 quarters)
                if (ex.Message.Contains("GetQuarterPerformance"))
                    break;
                throw;
            }
        }
    }

    /// <summary>
    /// Calculate the strength of the given ticker for dates between the given ones inclusive
    /// </summary>
    /// <param name="context"></param>
    /// <param name="ticker"></param>
    /// <param name="startDate"></param>
    /// <param name="endDate"></param>
    public static void CalculateStrength(this ApplicationDbContext context, string ticker, DateTime startDate, DateTime endDate)
    {
        // We need 1 year of data to calculate strength
        var minimumDataDate = startDate.AddYears(-1).AddMonths(-1);
        var data = context.PriceData.Where(p => p.Ticker == ticker && minimumDataDate <= p.Datetime && p.Datetime <= endDate)
                                    .OrderBy(p => p.Datetime)
                                    .ToArray();

        CalculateStrength(data, stopDate: startDate);

        foreach(var entity in data.Where(d => d.Datetime >= startDate))
            context.MarkDirty(entity, e => e.Strength);
        context.SaveChanges();
    }

    /// <summary>
    /// Calculate relative strength of the given data, versus the given reference. Assumes both arrays are sorted in descending datetime order!
    /// If stopDate is given, then stop the calculation at that day (the calculation happens for that day)
    /// </summary>
    /// <param name="data"></param>
    /// <param name="reference"></param>
    public static void CalculateRelativeStrength(TickerData[] data, TickerData[] reference, DateTime? stopDate = null)
    {
        var referenceStr = reference.First().Ticker;
        // i: index in data, j: index in reference
        // We've seen that datetime sometimes is not aligned, so we need to advance i/j until the dates are aligned
        for(int i = 0, j = 0; i < Math.Min(data.Length, reference.Length) && j < Math.Min(data.Length, reference.Length); )
        {
            if(data[i].Datetime > reference[j].Datetime)
            {
                i++;
                continue;
            }
            else if(data[i].Datetime < reference[j].Datetime)
            {
                j++;
                continue;
            }

            // Both datetimes are equal here, thanks to the above if statements
            if(stopDate.HasValue && data[i].Datetime >= stopDate)
            {
                var relativeStrength = data[i].GetRelativeStrength(reference[j]);
                data[i].RelativeStrength = relativeStrength;
                data[i].ReferenceTicker = referenceStr;
            }
            i++;
            j++;
            // Note there was a spurious if(i > 10) break; here. I think it's not needed
        }
    }

    public static void CalculateRelativeStrength(this ApplicationDbContext context, string ticker, string referenceTicker, DateTime startDate, DateTime endDate)
    {
        var minimumDataDate = startDate.AddYears(-1).AddMonths(-1);
        var data = context.PriceData.Where(p => p.Ticker == ticker && minimumDataDate <= p.Datetime && p.Datetime <= endDate)
                                    .OrderByDescending(p => p.Datetime)
                                    .ToArray();
        var reference = context.PriceData.Where(p => p.Ticker == referenceTicker && minimumDataDate <= p.Datetime && p.Datetime <= endDate)
                                         .OrderByDescending(p => p.Datetime)
                                         .ToArray();

        CalculateRelativeStrength(data, reference, stopDate: startDate);
        foreach(var entity in data.Where(d => d.Datetime >= startDate))
            context.MarkDirty(entity, e => e.RelativeStrength, e => e.ReferenceTicker);
        context.SaveChanges();
    }

    public static void CalculatePercentiles(this ApplicationDbContext context, DateTime date)
    {
        var data = context.PriceData.Where(d => d.Datetime == date)
                                    .AsNoTracking()
                                    .ToList();

        if(data.Count > 0)
        {
            var percentiles = data.QCut(100);
            foreach(var entity in percentiles)
                context.MarkDirty(entity, e => e.Percentile);

            context.SaveChanges();
        }
    }

    public static void MarkDirty<TEntity, TProperty>(this ApplicationDbContext context, TEntity entity, Expression<Func<TEntity, TProperty>> expression) where TEntity : class
    {
        context.Attach(entity);
        context.Entry(entity).Property(expression).IsModified = true;
    }

    public static void MarkDirty<TEntity, TProperty1, TProperty2, TProperty3, TProperty4>(this ApplicationDbContext context, TEntity entity,
                                                                  Expression<Func<TEntity, TProperty1>> expression1,
                                                                  Expression<Func<TEntity, TProperty2>> expression2,
                                                                  Expression<Func<TEntity, TProperty3>> expression3,
                                                                  Expression<Func<TEntity, TProperty4>> expression4) where TEntity : class
    {
        context.Attach(entity);
        context.Entry(entity).Property(expression1).IsModified = true;
        context.Entry(entity).Property(expression2).IsModified = true;
        context.Entry(entity).Property(expression3).IsModified = true;
        context.Entry(entity).Property(expression4).IsModified = true;
    }

    public static void MarkDirty<TEntity, TProperty1, TProperty2>(this ApplicationDbContext context, TEntity entity,
                                                                  Expression<Func<TEntity, TProperty1>> expression1,
                                                                  Expression<Func<TEntity, TProperty2>> expression2) where TEntity : class
    {
        context.Attach(entity);
        context.Entry(entity).Property(expression1).IsModified = true;
        context.Entry(entity).Property(expression2).IsModified = true;
    }
}