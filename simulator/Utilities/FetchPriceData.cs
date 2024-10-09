using System.Diagnostics;
using System.Globalization;
using CsvHelper;

namespace simulator.Utilities;

public static partial class Utilities
{
    public static string AdjustDaysDifference(int days)
    {
        if(days == 0) return "";
        if(days == 1) return "1d";
        if(days <= 3) return "5d";
        if(days <= 30) return "1mo";
        if(days <= 90) return "3mo";
        return "max";
    }
    public static List<TickerDataCSV> GetTickerData(string period, string file, List<string>? tickers = null)
    {
        if(string.IsNullOrEmpty(period) || string.IsNullOrEmpty(file))
            throw new Exception("GetTickerData: Provide both period and file arguments");

        var startInfo = new ProcessStartInfo
        {
            UseShellExecute = false,
            FileName = "python3",
            Arguments = "fetch_prices.py",
        };
        startInfo.EnvironmentVariables["PERIOD"] = period;
        startInfo.EnvironmentVariables["FILE"] = file;
        if(tickers != null)
            startInfo.EnvironmentVariables["TICKERS"] = string.Join(",", tickers);

        var process = Process.Start(startInfo);
        process?.WaitForExit();

        if(process?.ExitCode == 0 && Path.Exists(file))
        {
            using var reader = new StreamReader(file);
            using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
            return csv.GetRecords<TickerDataCSV>().ToList();
        }
        else
            throw new Exception($"GetTickerData: Python program exited with non-zero code: '{process?.ExitCode}'");
    }
}