using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;

public class ApplicationDbContext : DbContext
{
    public DbSet<ValuationData> ValuationData { get; set; }
    public DbSet<DDMValuationInput> DDMValuationInputs { get; set; }
    public DbSet<Valuation> Valuations { get; set; }
    public DbSet<Company> Companies { get; set; }

    public ApplicationDbContext()
    {
    }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelbuilder)
    {
        base.OnModelCreating(modelbuilder);
        
        modelbuilder.Entity<Valuation>()
           .Property(t => t.TerminalValuePV)
           .HasPrecision(19, 4);

        modelbuilder.Entity<Valuation>()
           .Property(t => t.IntrinsicValue)
           .HasPrecision(19, 4);

        modelbuilder.Entity<Valuation>()
            .HasOne(v => v.ValuationInput)
            .WithOne(t => t.Valuation);

        modelbuilder.Entity<Valuation>()
            .HasOne(v => v.Company)
            .WithMany(t => t.Valuations)
            .OnDelete(DeleteBehavior.Cascade);

        modelbuilder.Entity<DDMValuationInput>()
           .Property(t => t.BaseEPS)
           .HasPrecision(19, 4);
      
        modelbuilder.Entity<DDMValuationInput>()
           .Property(t => t.DividendWitholdingTax)
           .HasPrecision(19, 4);
      
        modelbuilder.Entity<DDMValuationInput>()
           .Property(t => t.EpsGrowth)
           .HasPrecision(19, 4);
      
        modelbuilder.Entity<DDMValuationInput>()
           .Property(t => t.PayoutRatio)
           .HasPrecision(19, 4);
      
        modelbuilder.Entity<DDMValuationInput>()
           .Property(t => t.ReturnRate)
           .HasPrecision(19, 4);
      
        modelbuilder.Entity<DDMValuationInput>()
           .Property(t => t.StableEPSGrowth)
           .HasPrecision(19, 4);
      
        modelbuilder.Entity<DDMValuationInput>()
           .Property(t => t.StablePayoutRatio)
           .HasPrecision(19, 4);
      
        modelbuilder.Entity<DDMValuationInput>()
           .Property(t => t.StableReturnRate)
           .HasPrecision(19, 4);
      
        modelbuilder.Entity<ValuationData>()
           .Property(t => t.Value)
           .HasPrecision(19, 4);
    }
}
