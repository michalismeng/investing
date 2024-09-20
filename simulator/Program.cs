using System.Collections.Immutable;
using System.Data.Common;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.EntityFrameworkCore;
using Skender.Stock.Indicators;
using simulator.Model;
using simulator.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(ApplicationDbContext.connectionString, ServerVersion.AutoDetect(ApplicationDbContext.connectionString), mySqlOptions => mySqlOptions.CommandTimeout(500))
);

// Add services to the container.
builder.Services.AddRazorPages();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<ApplicationDbContext>();
    context.Database.Migrate();
}

decimal TryParseDefault(string text)
{
    if(decimal.TryParse(text, out decimal value))
        return value;
    else
        return 0;
}

if(Environment.GetEnvironmentVariable("TICKER_INFO_FILE") != null)
{
    // Load ticker info symbols from file
    // Example record: "A": {"info": {"industry": "Diagnostics & Research", "sector": "Healthcare", "marketCap": 39358554112}}
    System.Console.WriteLine("Loading ticker entries from {0}...", Environment.GetEnvironmentVariable("TICKER_INFO_FILE")!);
    using StreamReader reader = new(Environment.GetEnvironmentVariable("TICKER_INFO_FILE")!);
    var json = reader.ReadToEnd();
    var obj = JsonSerializer.Deserialize<Dictionary<string, JsonNode>>(json)!;

    using var context = app.Services.CreateScope().ServiceProvider.GetRequiredService<ApplicationDbContext>();

    System.Console.WriteLine("Inserting or updating {0} ticker entries...", obj.Keys.Count);
    var updateCnt = 0;
    var insertCnt = 0;

    foreach(var key in obj.Keys)
    {
        var existing = context.Tickers.Find(key);
        var info = obj[key]["info"]!;

        if(existing != null)
        {
            existing.MarketCap = TryParseDefault(info["marketCap"]!.ToString());
            existing.DateUpdated = DateTime.UtcNow;
            context.Tickers.Update(existing);
            updateCnt++;
        }
        else
        {
            context.Tickers.Add(new TickerInfo
            {
                Ticker = key,
                Name = info["name"]!.ToString(),
                DateCreated = DateTime.UtcNow,
                DateUpdated = DateTime.UtcNow,
                Sector = info["sector"]!.ToString(),
                Industry = info["industry"]!.ToString(),
                MarketCap = TryParseDefault(info["marketCap"]!.ToString()),
            });
            insertCnt++;
        }
    }

    context.SaveChanges();
    System.Console.WriteLine("Added {0} and updated {1} existing ticker info entries.", insertCnt, updateCnt);
}
else if(Environment.GetEnvironmentVariable("PRICE_DATA_FOLDER") != null)
{
    // Took 20 minutes to run e2e

    // {{"candles": [{"open": 377.71688028842055, "close": 381.0350646972656, "low": 375.58302989505836, "high": 381.24060854211376, "volume": 172996900, "datetime": 1678838400}, ... }]}

    var files = Directory.GetFiles(Environment.GetEnvironmentVariable("PRICE_DATA_FOLDER")!).Where(f => f.EndsWith(".json")).Order();

    System.Console.WriteLine("Found {0} symbols", files.Count());

    Parallel.ForEach(files, new ParallelOptions { MaxDegreeOfParallelism = 8 }, file =>
    {
        using var context = app.Services.CreateScope().ServiceProvider.GetRequiredService<ApplicationDbContext>();
        context.ChangeTracker.AutoDetectChangesEnabled = false;
        var ticker = Path.GetFileName(file).Split(".").First();
        System.Console.WriteLine("Parsing data for {0}", ticker);

        using StreamReader reader = new(file);
        var json = reader.ReadToEnd();
        var obj = JsonSerializer.Deserialize<Dictionary<string, JsonNode>>(json)!;

        var existing = context.PriceData.Where(d => d.Ticker == ticker);
        if (existing.Any())
        {
            System.Console.WriteLine("Ticker '{0}' already exists. Purging existing data...", ticker);
            context.RemoveRange(existing.ToList());
            context.SaveChanges();
        }

        var candles = obj["candles"]!.AsArray();

        if (candles.Count == 0)
        {
            // System.Console.WriteLine("No data for {0}", ticker);
            return;
        }

        var priceData = candles.Select(candle => new TickerData
        {
            Ticker = ticker,
            Open = decimal.Parse(candle!["open"]!.ToString(), System.Globalization.NumberStyles.Float),
            Close = decimal.Parse(candle["close"]!.ToString(), System.Globalization.NumberStyles.Float),
            Low = decimal.Parse(candle["low"]!.ToString(), System.Globalization.NumberStyles.Float),
            High = decimal.Parse(candle["high"]!.ToString(), System.Globalization.NumberStyles.Float),
            Volume = decimal.Parse(candle["volume"]!.ToString(), System.Globalization.NumberStyles.Float),
            Datetime = DateTimeOffset.FromUnixTimeSeconds(long.Parse(candle["datetime"]!.ToString())).UtcDateTime,
        }).ToList();
        context.AddRange(priceData);
        context.SaveChanges();

        System.Console.WriteLine("Added price data for ticker {0} from {1} to {2}", ticker,
                                                                                    priceData.MinBy(d => d.Datetime)!.Datetime.ToString("MMM dd, yyyy"),
                                                                                    priceData.MaxBy(d => d.Datetime)!.Datetime.ToString("MMM dd, yyyy"));
        priceData.Clear();
        obj.Clear();

    });
}
else if(Environment.GetEnvironmentVariable("MODE") == "strength")
{
    // Caclulate strength for all tickers in database.

    // Took 15 minutes to run e2e
    using var context = app.Services.CreateScope().ServiceProvider.GetRequiredService<ApplicationDbContext>();
    
    var tickers = context.Tickers.Select(t => t.Ticker).ToList().Order();

    Parallel.ForEach(tickers, new ParallelOptions { MaxDegreeOfParallelism = 8 }, ticker =>
    {
        using var _context = app.Services.CreateScope().ServiceProvider.GetRequiredService<ApplicationDbContext>();
        _context.ChangeTracker.AutoDetectChangesEnabled = false;
        var data = _context.PriceData.Where(d => d.Ticker == ticker).OrderBy(d => d.Datetime).ToArray();
        System.Console.WriteLine("Calculating strength of ticker {0}", ticker);
        foreach(var i in Enumerable.Range(0, data.Length))
        {
            // Get strength of i-th last date
            var dataFiltered = data.AsSpan(0, data.Length - i);

            try
            {
                var strength = dataFiltered.GetStrength();

                var latest = dataFiltered[^1];
                latest.Strength = strength;
                _context.Update(latest);
            }
            catch(Exception ex)
            {
                // This exception means there aren't enough past data from the i-th entry to calculate the strength (we need 4 quarters)
                if (ex.Message.Contains("GetQuarterPerformance"))
                    break;
                throw;
            }
        }
        _context.SaveChanges();
    });

}
else if(Environment.GetEnvironmentVariable("MODE") == "relative-strength")
{
    // Caclulate relative strength for all tickers in database. The reference index for all tickers is SPY for now.

    // Took 25 minutes to run
    using var context = app.Services.CreateScope().ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var tickers = context.Tickers.Select(t => t.Ticker).ToList().Order();
    var reference = context.PriceData.Where(d => d.Ticker == "SPY").ToList().OrderByDescending(d => d.Datetime).ToArray();

    Parallel.ForEach(tickers, new ParallelOptions { MaxDegreeOfParallelism = 8 }, ticker =>
    {
        using var _context = app.Services.CreateScope().ServiceProvider.GetRequiredService<ApplicationDbContext>();
        _context.ChangeTracker.AutoDetectChangesEnabled = false;
        var data = _context.PriceData.Where(d => d.Ticker == ticker).OrderByDescending(d => d.Datetime).ToArray();

        System.Console.WriteLine("Calculating strength of ticker {0}", ticker);
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
            var relativeStrength = data[i].GetRelativeStrength(reference[j]);
            data[i].RelativeStrength = relativeStrength;
            data[i].ReferenceTicker = "SPY";
            _context.Update(data[i]);
            i++;
            j++;
            if(i > 10) break;
        }

        _context.SaveChanges();
    });
}
else if(Environment.GetEnvironmentVariable("MODE") == "percentile")
{
    // Calculate the percentile for the relative strength for each day.

    // Took 40 minutes to run.
    // The CPU utilization is very low with the code below. Maybe we can increase parallelism.
    using var context = app.Services.CreateScope().ServiceProvider.GetRequiredService<ApplicationDbContext>();

    System.Console.WriteLine("Getting min and max dates in database...");
    var minDate = context.PriceData.Select(p => p.Datetime).Min();
    var maxDate = context.PriceData.Select(p => p.Datetime).Max();

    var dates = Enumerable.Range(0, 1 + maxDate.Subtract(minDate).Days)
                          .Select(offset => minDate.AddDays(offset))
                          .OrderDescending()
                          .ToList();

    Parallel.ForEach(dates, new ParallelOptions { MaxDegreeOfParallelism = 8 }, date =>
    {
        using var _context = app.Services.CreateScope().ServiceProvider.GetRequiredService<ApplicationDbContext>();
        _context.ChangeTracker.AutoDetectChangesEnabled = false;

        System.Console.WriteLine("Calculating ticker percentiles for {0}", date.Date);
        var data = _context.PriceData.AsNoTracking().Where(d => d.Datetime == date).ToList();
        var percentiles = data.QCut(100).ToList();

        foreach(var entity in percentiles)
        {
            _context.Attach(entity);
            _context.Entry(entity).Property(e => e.Percentile).IsModified = true;
        }
        System.Console.WriteLine("Updating entities");
        _context.SaveChanges();
    });
}
else
{
    app.UseHttpsRedirection();
    app.UseStaticFiles();

    app.UseRouting();

    app.UseAuthorization();

    app.MapRazorPages();

    app.Run();
}