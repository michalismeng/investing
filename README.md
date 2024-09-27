## Growth stock trading advisor

### How to

1. Install latest .NET https://dotnet.microsoft.com/en-us/download.
2. Set up a MySQL database and change the connection string in `ApplicationDbContext.cs`.
3. Seed the database, see below.
4. Run `dotnet watch run`.

### Seed the database

1. Run the `relative-strength` Python program to get prices from YFinance.
2. See `Program.cs` for the different env vars you can set to run different initializaiton phases. These must run in order they are defined, because calculations depend on previous results.
