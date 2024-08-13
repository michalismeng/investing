using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;

public class ApplicationDbContext : DbContext
{
    public DbSet<ValuationData> ValuationData { get; set; }
    public DbSet<Valuation> Valuations { get; set; }

    public ApplicationDbContext()
    {
    }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelbuilder)
    {
        base.OnModelCreating(modelbuilder);
        
        modelbuilder.Entity<ValuationData>()
           .Property(t => t.Value)
           .HasPrecision(19, 4);
    }
}
