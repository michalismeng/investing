def discount(v, d, p):
    return v * (1 + d) ** (-1 * p)

def dcf(revenue, shares, r_growth, p_margin, d, pe, periods):
    ps = list(range(0, periods))
    revenue_series = [revenue * (1 + r_growth) ** p for p in ps]
    revenue_series += [revenue_series[-1] * pe]
    earnings_series = [r * p_margin for r in revenue_series]
    pv = [discount(r, d, p + 1) for (p, r)
          in enumerate(earnings_series[:-1])]
    pv += [discount(earnings_series[-1], d, len(earnings_series) - 1)]
    fair_value = sum(pv)
    return fair_value

print(dcf(112, 0, 0.15, 0.31, 0.125, 18, 10))
