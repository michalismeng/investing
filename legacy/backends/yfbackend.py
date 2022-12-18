import yfinance as yf
import pandas as pd

import number

class YFinanceBackend:
    """Finance backed by the yfinance library."""

    def __init__(self, symbol):
        self.ticker = yf.Ticker(symbol)

    def currency(self):
        return self.ticker.info["currency"]

    def symbol(self):
        return self.ticker.info["symbol"]

    def name(self):
        return self.ticker.info["longName"]

    def exchange(self):
        return self.ticker.info["exchange"]

    def market_cap(self):
        return number.Currency(self.ticker.info["marketCap"])

    def revenue_ttm(self):
        return number.Currency(self.ticker.info["totalRevenue"])

    def net_income_ttm(self):
        return number.Currency(self.ticker.info["netIncomeToCommon"])

    def pe_ttm(self):
        try:
            return number.Number(self.ticker.info["trailingPE"])
        except KeyError:
            return number.Number(None)

    def shares_outstanding(self):
        return number.Amount(self.ticker.info["sharesOutstanding"])

    #### 5-year PE ?

    def profit_margin_ttm(self):
        return number.Percent(self.ticker.info["profitMargins"])

    def gross_profit_margin_ttm(self):
        return number.Percent(self.ticker.info["grossMargins"])

    ## Business description

    def description(self):
        return self.ticker.info["longBusinessSummary"]

    def sector(self):
        return self.ticker.info["sector"]

    def website(self):
        return self.ticker.info["website"]

    def next_earnings(self):
        try:
            return self.ticker.calendar.loc["Earnings Date", "Value"]
        except Exception:
            return ""

    ## Create second column of 8-pillars video

    def ps_ttm(self):
        return number.Number(self.ticker.info["priceToSalesTrailing12Months"])

    def fcf_ttm(self):
        return number.Currency(self.ticker.info["freeCashflow"])

    def income_statement(self):
        f = self.ticker.financials
        fq = self.ticker.quarterly_financials

        ttm = fq.sum(axis=1)
        result = pd.concat([ttm, f], axis=1)
        result = result.applymap(lambda x: number.Currency(x))
        result = result.rename(columns={0: "TTM"})
        return result.rename(columns=lambda x: number.Date(x))

    def balance_sheet(self):
        b = self.ticker.balance_sheet
        bq = self.ticker.quarterly_balance_sheet

        ttm = bq.mean(axis=1)
        result = pd.concat([ttm, b], axis=1)
        # XXX: Not all items are Currency
        result = result.applymap(lambda x: number.Currency(x))
        result = result.rename(columns={0: "TTM"})
        return result.rename(columns=lambda x: number.Date(x))


    def cashflow_statement(self):
        c = self.ticker.cashflow
        cq = self.ticker.quarterly_cashflow

        ttm = cq.sum(axis=1)
        result = pd.concat([ttm, c], axis=1)
        result = result.applymap(lambda x: number.Currency(x))
        result = result.rename(columns={0: "TTM"})
        return result.rename(columns=lambda x: number.Date(x))

    def dividends_paid_ttm(self):
        cq = self.ticker.quarterly_cashflow
        try:
            value = -cq.loc["Dividends Paid"].sum()
        except Exception:
            value = None
        return number.Currency(value)

    def dividend_yield_ttm(self):
        dividends = self.dividends_paid_ttm()
        if dividends.value is None:
            return None
        market = self.ticker.info["marketCap"]
        return number.Percent(dividends.value / market)

