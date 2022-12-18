import pandas as pd
from tabulate import tabulate
import textwrap

from backends import edgar_utils

class TickerInfo():
    """Displays information about a Ticker."""

    def __init__(self, backend):
        self.backend = backend

    def show_summary(self):
        edgar_filings = edgar_utils.get_filings_url(self.backend.symbol())
        intro = ("====== %s (%s:%s) %s ======"
                 % (self.backend.name(), self.backend.exchange(),
                    self.backend.symbol(), self.backend.currency()))
        print(intro)
        print(textwrap.fill(self.backend.description(), width=80))
        print()
        print("Sector: %s" % self.backend.sector())
        print("Website: %s" % self.backend.website())
        print("Next earnings call: %s (UTC)" % self.backend.next_earnings())
        print("EDGAR filings webpage: %s" % edgar_filings)
        print()

    def show_general(self):
        print("==== General Stats ====")
        print("Market Cap %s" % self.backend.market_cap())
        print("Revenue (TTM) %s" % self.backend.revenue_ttm())
        print("Net Income (TTM) %s" % self.backend.net_income_ttm())
        print("P/E (TTM) %s" % self.backend.pe_ttm())
        print("Profit Margin (TTM) %s" % self.backend.profit_margin_ttm())
        print(("Gross Profit Margin (TTM) %s"
               % self.backend.gross_profit_margin_ttm()))
        print()

        print("PS ratio (TTM) %s" % self.backend.ps_ttm())
        print("Free Cash Flow (TTM) %s" % self.backend.fcf_ttm())
        print("Dividend Yield (TTM) %s" % self.backend.dividend_yield_ttm())
        print("Dividends Paid (TTM) %s" % self.backend.dividends_paid_ttm())
        print()

    def show_income(self):
        rows = ["Total Revenue", "Net Income", "Gross Profit",
                "Total Operating Expenses", "Operating Income"]
        income_statement = self.backend.income_statement().loc[rows]
        income_statement = self.backend.income_statement()
        income_statement.index.name = "==== Income Statement ===="
        print(tabulate(income_statement, headers="keys"))
        print()

    def show_balance(self):
        balance_sheet = self.backend.balance_sheet()
        non_cur = (balance_sheet.loc["Total Liab"]
                   - balance_sheet.loc["Total Current Liabilities"])

        non_cur = (pd.DataFrame(non_cur).transpose()
                   .rename(index={0: "Total Non Current Liabilties"}))
        balance_sheet = pd.concat([balance_sheet, non_cur])
        balance_sheet.index.name = "==== Balance Sheet ===="
        print(tabulate(balance_sheet, headers="keys"))
        print()

    def show_cashflow(self):
        cashflow_statement = self.backend.cashflow_statement()
        fcf = (cashflow_statement.loc["Total Cash From Operating Activities"]
               + cashflow_statement.loc["Capital Expenditures"])
        fcf_avg = fcf.sum() / len(fcf)
        fcf = (pd.DataFrame(fcf).transpose()
                 .rename(index={0: "Free Cash Flow (5YR AVG: %s)" % fcf_avg}))

        cashflow_statement = pd.concat([cashflow_statement, fcf])
        cashflow_statement.index.name = "==== Cashflow Statement ===="
        print(tabulate(cashflow_statement, headers="keys"))
        print()

    def display(self):
        self.show_summary()
        self.show_general()
        self.show_income()
        self.show_balance()
        self.show_cashflow()

import sys
from backends.yfbackend import YFinanceBackend

ticker = sys.argv[1] if len(sys.argv) > 1 else None
if ticker:
    backend = YFinanceBackend(ticker)
    info = TickerInfo(backend)
    info.display()

