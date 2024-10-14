using Microsoft.EntityFrameworkCore;

namespace simulator.Model;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

    public static readonly string connectionString = "Server=localhost; User ID=root; Password=Mixalis97@@; Database=InvestingSimulator";
    public DbSet<TickerInfo> Tickers { get; set; }
    public DbSet<TickerData> PriceData { get; set; }

    protected override void OnModelCreating(ModelBuilder modelbuilder)
    {
        base.OnModelCreating(modelbuilder);

        modelbuilder.Entity<TickerInfo>().HasKey(x => x.Ticker);
        // modelbuilder.Entity<TickerInfo>().HasMany(x => x.PriceData).WithOne(x => x.TickerInfo).HasForeignKey(x => x.Ticker);
        modelbuilder.Entity<TickerData>().HasKey(x => new { x.Ticker, x.Datetime });
        // modelbuilder.Entity<TickerData>().HasOne(x => x.ReferenceTickerInfo).WithMany().HasForeignKey(x => x.ReferenceTicker);
        modelbuilder.Entity<TickerData>().HasIndex(x => x.Datetime);
    }
}

public class DorisDbContext : DbContext
{
    public DorisDbContext(DbContextOptions<DorisDbContext> options)
            : base(options)
        {
        }

    public static readonly string connectionString = "Server=127.0.0.1; User ID=root; Port=9030; Database=InvestingSimulator";
    public DbSet<TickerInfo> Tickers { get; set; }
    public DbSet<TickerData> PriceData { get; set; }

    protected override void OnModelCreating(ModelBuilder modelbuilder)
    {
        base.OnModelCreating(modelbuilder);
        modelbuilder.Entity<TickerInfo>().HasNoKey();
        modelbuilder.Entity<TickerData>().HasNoKey();

    }
}
