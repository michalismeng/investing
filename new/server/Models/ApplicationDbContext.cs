using Microsoft.EntityFrameworkCore;

namespace Investing.Models;

public class InvestingDbContext(DbContextOptions<InvestingDbContext> options) : DbContext(options)
{
}