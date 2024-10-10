using System.Collections.Immutable;
using System.Data.Common;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.EntityFrameworkCore;
using Skender.Stock.Indicators;
using simulator.Model;
using simulator.Extensions;
using simulator.Utilities;
using simulator.Pages;

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
        Utilities.CalculateStrength(data);
        foreach(var entity in data)
            _context.MarkDirty(entity, e => e.Strength);
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
        Utilities.CalculateRelativeStrength(data, reference);
        foreach(var entity in data)
        {
            _context.MarkDirty(entity, e => e.RelativeStrength);
            _context.MarkDirty(entity, e => e.RelativeStrength);
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
        context.CalculatePercentiles(date);
    });
}
else if(Environment.GetEnvironmentVariable("MODE") == "daily")
{
    // TODO: Update tickers database

    // Took <5 minutes to run
    using var context = app.Services.CreateScope().ServiceProvider.GetRequiredService<ApplicationDbContext>();

    var period = Environment.GetEnvironmentVariable("PERIOD") ?? "1mo";
    var tickerDataNew = Utilities.GetTickerData(period, $"../relative-strength/data/{DateTime.Today:yyyy-MM-dd}.csv")
                                 .GroupBy(t => t.Ticker)
                                 .Select(g => (g.Key ?? "", g.ToList()))
                                 .ToList();
    var tickerDataNewDict = tickerDataNew.ToDictionary();

    // Get data of stocks that had a split
    var tickerSplits = tickerDataNew.Where(t => t.Item2.Any(s => s.StockSplits > 0)).Select(t => t.Item1).Distinct().ToList();
    var tickerSplitData = new Dictionary<string, List<TickerDataCSV>>();
    if(tickerSplits.Count > 0)
    {
        System.Console.WriteLine("The following stocks split");
        foreach(var s in tickerSplits) System.Console.WriteLine("Stock split: {0}", s);
        tickerSplitData = Utilities.GetTickerData("max", $"../relative-strength/data/{DateTime.Today:yyyy-MM-dd}-splits.csv", [..tickerSplits])
                                   .GroupBy(t => t.Ticker)
                                   .Select(g => (g.Key ?? "", g.ToList()))
                                   .ToDictionary();
    }

    // Prepare reference ticker
    var latestReferenceDate = context.PriceData.Where(p => p.Ticker == "SPY")
                                       .OrderByDescending(p => p.Datetime)
                                       .AsNoTracking()
                                       .FirstOrDefault()?.Datetime ?? DateTime.Today;

    var tickerRecordsToAdd = tickerDataNewDict["SPY"].Where(t => t.Datetime > latestReferenceDate && t.Datetime < DateTime.Today).Select(r => r.ToTickerData());
    if (tickerRecordsToAdd.Any())
    {
        context.AddRange(tickerRecordsToAdd);
        context.SaveChanges();

        var minAddedDate = tickerRecordsToAdd.MinBy(d => d.Datetime)!.Datetime;
        var maxAddedDate = tickerRecordsToAdd.MaxBy(d => d.Datetime)!.Datetime;

        System.Console.WriteLine("Added {3} price data records for ticker {0} from {1} to {2}",
                                                                                    "SPY",
                                                                                    minAddedDate.ToString("MMM dd, yyyy"),
                                                                                    maxAddedDate.ToString("MMM dd, yyyy"),
                                                                                    tickerRecordsToAdd.Count());
        System.Console.WriteLine("Calculating strength for ticker {0} between dates {1} and {2}",
                                                                                    "SPY",
                                                                                    minAddedDate.ToString("MMM dd, yyyy"),
                                                                                    maxAddedDate.ToString("MMM dd, yyyy"));

        context.CalculateStrength("SPY", minAddedDate, maxAddedDate);

        System.Console.WriteLine("Calculating relative strength for ticker {0} between dates {1} and {2}",
                                                                                    "SPY",
                                                                                    minAddedDate.ToString("MMM dd, yyyy"),
                                                                                    maxAddedDate.ToString("MMM dd, yyyy"));
        context.CalculateRelativeStrength("SPY", "SPY", minAddedDate, maxAddedDate);
    }

    var tickers = context.Tickers.ToList();
    _ = Parallel.ForEach(tickers, new ParallelOptions { MaxDegreeOfParallelism = 8 }, ticker =>
    {
        using var _context = app.Services.CreateScope().ServiceProvider.GetRequiredService<ApplicationDbContext>();
        _context.ChangeTracker.AutoDetectChangesEnabled = false;

        var latestDate = _context.PriceData.Where(p => p.Ticker == ticker.Ticker)
                                           .OrderByDescending(p => p.Datetime)
                                           .AsNoTracking()
                                           .FirstOrDefault()?.Datetime ?? DateTime.Today;
        if (tickerSplits.Contains(ticker.Ticker))
        {
            // Overwrite all history because there's been a stock split (i.e., change all existing records. Records from the provider are used up until latestDate)
            System.Console.WriteLine("Stock {0} had a split. Overwriting all existing price data...", ticker.Ticker);
            var existingRecords = _context.PriceData.AsNoTracking().Where(p => p.Ticker == ticker.Ticker).ToList();
            foreach(var r in existingRecords)
            {
                var splitRecord = tickerSplitData[ticker.Ticker].SingleOrDefault(rr => rr.Datetime == r.Datetime);
                if(splitRecord == null)
                    continue;

                r.Open = splitRecord.Open;
                r.Close = splitRecord.Close;
                r.High = splitRecord.High;
                r.Low = splitRecord.Low;
                _context.MarkDirty(r, e => e.Open, e => e.Close, e => e.High, e => e.Low);
            }

            _context.SaveChanges();
        }

        var tickerRecordsToAdd = tickerDataNewDict.ContainsKey(ticker.Ticker) ? 
                                 tickerDataNewDict[ticker.Ticker].Where(t => t.Datetime > latestDate && t.Datetime < DateTime.Today).Select(r => r.ToTickerData()) :
                                 [];

        if (tickerRecordsToAdd.Any())
        {
            _context.AddRange(tickerRecordsToAdd);
            _context.SaveChanges();

            var minAddedDate = tickerRecordsToAdd.MinBy(d => d.Datetime)!.Datetime;
            var maxAddedDate = tickerRecordsToAdd.MaxBy(d => d.Datetime)!.Datetime;

            System.Console.WriteLine("Added {3} price data records for ticker {0} from {1} to {2}",
                                                                                        ticker.Ticker,
                                                                                        minAddedDate.ToString("MMM dd, yyyy"),
                                                                                        maxAddedDate.ToString("MMM dd, yyyy"),
                                                                                        tickerRecordsToAdd.Count());
            System.Console.WriteLine("Calculating strength for ticker {0} between dates {1} and {2}",
                                                                                        ticker.Ticker,
                                                                                        minAddedDate.ToString("MMM dd, yyyy"),
                                                                                        maxAddedDate.ToString("MMM dd, yyyy"));

            _context.CalculateStrength(ticker.Ticker, minAddedDate, maxAddedDate);

            System.Console.WriteLine("Calculating relative strength for ticker {0} between dates {1} and {2}",
                                                                                        ticker.Ticker,
                                                                                        minAddedDate.ToString("MMM dd, yyyy"),
                                                                                        maxAddedDate.ToString("MMM dd, yyyy"));

            _context.CalculateRelativeStrength(ticker.Ticker, "SPY", minAddedDate, maxAddedDate);
        }
        else
        {
            System.Console.WriteLine("Nothing to update for ticker {0}", ticker.Ticker);
        }
    });

    // Calculate percentiles
    // Assume latestReferenceDate is the last day of data for all tickers
    var startDate = latestReferenceDate.AddDays(1);
    var endDate = DateTime.Today.AddDays(-1);
    var dates = Enumerable.Range(0, 1 + endDate.Subtract(startDate).Days)
                          .Select(offset => startDate.AddDays(offset))
                          .OrderDescending()
                          .ToList();

    if(dates.Count != 0)
    {
        System.Console.WriteLine("Calculating percentiles from {0} to {1}", dates.Min().ToString("yyyy-MM-dd"), dates.Max().ToString("yyyy-MM-dd"));
        Parallel.ForEach(dates, new ParallelOptions { MaxDegreeOfParallelism = 8 }, date =>
        {
            using var _context = app.Services.CreateScope().ServiceProvider.GetRequiredService<ApplicationDbContext>();
            _context.ChangeTracker.AutoDetectChangesEnabled = false;

            System.Console.WriteLine("Calculating ticker percentiles for {0}", date.Date);
            _context.CalculatePercentiles(date);
        });
    }
    else
    {
        System.Console.WriteLine("Nothing to do for percentiles calculation");
    }
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