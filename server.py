import pandas as pd
from flask import *
import os
import model
import metadata

app = Flask(__name__)

## TODO: Check MASTERMIND, INC.  1088638 has duplicate cik with another company.
## TODO: Reading 2020q2 raises warning:
# DtypeWarning: Columns (35) have mixed types. Specify dtype option on import or set low_memory=False.
#  sub = pd.read_csv("20%sq%s/sub.txt" % (file, q), delimiter="\t")
## TODO: Check former changed name. The same company has multiple filings under different names.
## TODO: Save these entries in the database, so we don't have to retrieve them every time.
# Consider saving them as we parse the data files.

data = []
for file in ["22", "21", "20", "19", "18", "17", "16", "15", "14", "13", "12", "11", "10", "09"]:
    for q in ["4", "3", "2", "1"]:
        path = "data/20%sq%s/sub.txt"
        if os.path.exists(path % (file, q)):
            sub = pd.read_csv(path % (file, q), delimiter="\t",
                                dtype={"cik": str, "sic": str, "fy": str, "fye": str, "period": str})
            sub = sub[sub["fp"] == "FY"]
            data.append(sub)

entries = pd.concat(data)
formatted_entries = entries[["adsh", "cik", "name", "fye", "fy", "form", "period", "filed", "accepted"]]
formatted_entries = formatted_entries.sort_values(by=["name", "fy", "form"])

def scheme_name_from_company_names(company_names):
    return "-".join(sorted(company_names))


def get_scheme(name, stmt):
    result = metadata.Company.objects.get(name=name).schemes.get(stmt, "")
    return pd.DataFrame([(stmt, result)], columns=["stmt", "value"])


@app.route("/api/submissions")
def api_show_index():
    global formatted_entries
    args = request.args.to_dict()
    result = formatted_entries
    if args["name"]:
        result = result[result["name"].str.startswith(args["name"])]
    if args["form"]:
        forms = args["form"].split(",")
        result = result[result["form"].isin(forms)]
    # If no filtering was done, then trim the length of the results to 20
    if len(result) == len(formatted_entries):
        result = result.head(20)
    return result.head(100).to_dict(orient="records")


@app.route("/api/submissions/from-adsh", methods=["POST"])
def api_get_submissions_from_adsh():
    global formatted_entries
    data = request.json
    adsh = data["adsh"]
    return formatted_entries[formatted_entries["adsh"].isin(adsh)].to_json(orient="records")

def read_pickle(name, keep_tags=[], plabel_map={}, stmt="IS"):
    df = pd.read_pickle(name)
    df = df.T.reset_index()
    df.columns = df.iloc[0]
    df.rename(columns={"date": "tag"}, inplace=True)
    df = df[df["tag"].isin(keep_tags)]
    df["line"] = range(len(df))
    df["uom"] = df["tag"].apply(lambda x: "shares" if "AverageShs" in x else "USD")
    df["plabel"] = df["tag"].apply(lambda x: plabel_map[x])
    df["report"] = df["tag"].apply(lambda x: stmt)
    return df

@app.route("/api/csv/<stmt>")
def api_show_csv(stmt):
    metric_labels_income = {
    'revenue': 'Revenue',
    'costOfRevenue': 'Cost of Revenue',
    'grossProfit': 'Gross Profit',
    'researchAndDevelopmentExpenses': 'R&D Expenses',
    'generalAndAdministrativeExpenses': 'G&A Expenses',
    'sellingAndMarketingExpenses': 'S&M Expenses',
    'sellingGeneralAndAdministrativeExpenses': 'SG&A Expenses',
    'otherExpenses': 'Other Expenses',
    'operatingExpenses': 'Operating Expenses',
    'costAndExpenses': 'Cost and Expenses',
    'interestIncome': 'Interest Income',
    'interestExpense': 'Interest Expense',
    'depreciationAndAmortization': 'Depreciation & Amortization',
    'ebitda': 'EBITDA',
    'operatingIncome': 'Operating Income',
    'totalOtherIncomeExpensesNet': 'Total Other Income/Expenses',
    'incomeBeforeTax': 'Income Before Tax',
    'incomeTaxExpense': 'Income Tax Expense',
    'netIncome': 'Net Income',
    'eps': 'Earnings per Share (EPS)',
    'epsdiluted': 'Diluted Earnings per Share (EPS)',
    'weightedAverageShsOut': 'Weighted Shares Outstanding',
    'weightedAverageShsOutDil': 'Diluted Shares Outstanding'
}
    
    metric_labels_balance = {
    'cashAndCashEquivalents': 'Cash & Equivalents',
    'shortTermInvestments': 'Short-Term Investments',
    'cashAndShortTermInvestments': 'Cash & Short-Term Inv.',
    'netReceivables': 'Net Receivables',
    'inventory': 'Inventory',
    'otherCurrentAssets': 'Other Current Assets',
    'totalCurrentAssets': 'Total Current Assets',
    'propertyPlantEquipmentNet': 'PPE (Net)',
    'goodwill': 'Goodwill',
    'intangibleAssets': 'Intangible Assets',
    'goodwillAndIntangibleAssets': 'Goodwill & Intangibles',
    'longTermInvestments': 'Long-Term Investments',
    'taxAssets': 'Tax Assets',
    'otherNonCurrentAssets': 'Other Non-Current Assets',
    'totalNonCurrentAssets': 'Total Non-Current Assets',
    'otherAssets': 'Other Assets',
    'totalAssets': 'Total Assets',
    'accountPayables': 'Accounts Payable',
    'shortTermDebt': 'Short-Term Debt',
    'taxPayables': 'Tax Payables',
    'deferredRevenue': 'Deferred Revenue',
    'otherCurrentLiabilities': 'Other Current Liabilities',
    'totalCurrentLiabilities': 'Total Current Liabilities',
    'longTermDebt': 'Long-Term Debt',
    'deferredRevenueNonCurrent': 'Deferred Rev. (Non-Current)',
    'deferredTaxLiabilitiesNonCurrent': 'Deferred Tax Liabilities (Non-Current)',
    'otherNonCurrentLiabilities': 'Other Non-Current Liabilities',
    'totalNonCurrentLiabilities': 'Total Non-Current Liabilities',
    'otherLiabilities': 'Other Liabilities',
    'capitalLeaseObligations': 'Capital Lease Obligations',
    'totalLiabilities': 'Total Liabilities',
    'preferredStock': 'Preferred Stock',
    'commonStock': 'Common Stock',
    'retainedEarnings': 'Retained Earnings',
    'accumulatedOtherComprehensiveIncomeLoss': 'Other Comp. Income/Loss',
    'othertotalStockholdersEquity': 'Other Total Equity',
    'totalStockholdersEquity': 'Total Equity',
    'totalEquity': 'Total Equity',
    'totalLiabilitiesAndStockholdersEquity': 'Liabilities & Equity',
    'minorityInterest': 'Minority Interest',
    'totalLiabilitiesAndTotalEquity': 'Liabilities & Total Equity',
    'totalInvestments': 'Total Investments',
    'totalDebt': 'Total Debt',
    'netDebt': 'Net Debt'
}

    metric_labels_cashflow = {
    'netIncome': 'Net Income',
    'depreciationAndAmortization': 'Depreciation & Amortization',
    'deferredIncomeTax': 'Deferred Income Tax',
    'stockBasedCompensation': 'Stock-Based Compensation',
    'changeInWorkingCapital': 'Change in Working Capital',
    'accountsReceivables': 'Accounts Receivables',
    'inventory': 'Inventory',
    'accountsPayables': 'Accounts Payables',
    'otherWorkingCapital': 'Other Working Capital',
    'otherNonCashItems': 'Other Non-Cash Items',
    'netCashProvidedByOperatingActivities': 'Net Cash from Operations',
    'investmentsInPropertyPlantAndEquipment': 'Investments in PPE',
    'acquisitionsNet': 'Net Acquisitions',
    'purchasesOfInvestments': 'Purchases of Investments',
    'salesMaturitiesOfInvestments': 'Sales/Maturities of Investments',
    'otherInvestingActivites': 'Other Investing Activities',
    'netCashUsedForInvestingActivites': 'Net Cash from Investing',
    'debtRepayment': 'Debt Repayment',
    'commonStockIssued': 'Common Stock Issued',
    'commonStockRepurchased': 'Common Stock Repurchased',
    'dividendsPaid': 'Dividends Paid',
    'otherFinancingActivites': 'Other Financing Activities',
    'netCashUsedProvidedByFinancingActivities': 'Net Cash from Financing',
    'effectOfForexChangesOnCash': 'Effect of Forex Changes on Cash',
    'netChangeInCash': 'Net Change in Cash',
    'cashAtEndOfPeriod': 'Cash at End of Period',
    'cashAtBeginningOfPeriod': 'Cash at Beginning of Period',
    'operatingCashFlow': 'Operating Cash Flow',
    'capitalExpenditure': 'Capital Expenditure',
    'freeCashFlow': 'Free Cash Flow'
}

    if stmt.upper() == "IS":
        return read_pickle("income.pickle", metric_labels_income.keys(), metric_labels_income, "IS").to_json(orient="records")
    elif stmt.upper() == "BS":
        return read_pickle("balance.pickle", metric_labels_balance.keys(), metric_labels_balance, "BS").to_json(orient="records")
    elif stmt.upper() == "CF":
        return read_pickle("cashflow.pickle", metric_labels_cashflow.keys(), metric_labels_cashflow, "CF").to_json(orient="records")

@app.route("/api/financials/<name>")
def api_show_financial_data(name):

    stmt = request.args.get('stmt')
    view = request.args.get('view')

    adsh = metadata.Company.objects.get(name=name).submissions

    s = model.facts.select().where(model.facts.c.adsh.in_(adsh)).where(model.facts.c.stmt == stmt)
    conn = model.engine.connect()
    result = conn.execute(s)

    results = [r for r in result]
    df = pd.DataFrame(results, columns=["adsh", "name", "cik", "tag", "version", "ddate", "plabel", "report", "line", "stmt", "qtrs", "uom", "value"])

    # Taking the unique ddates fails when we have an amendment, and therefore have duplicate dates
    # We don't see the initial entries, but only the amended
    columns = list(df["ddate"].unique())
    columns.extend(["uom", "line", "plabel", "report"])
    columns.sort()
    df["sort_val"] = df["line"].apply(lambda x: int(x))
    index = df.sort_values(by="sort_val")["tag"].unique()

    result_df = pd.DataFrame(index=index, columns=columns)
    for _, value in df.iterrows():
        result_df[value["ddate"]][value["tag"]] = value["value"]
        # These items are per-row, but we give a value to each cell. Consider looking a all of them
        # They should all agree, e.g., all cells of a row have the same UOM.
        result_df["uom"][value["tag"]] = value["uom"]
        result_df["line"][value["tag"]] = value["line"]
        result_df["plabel"][value["tag"]] = value["plabel"]
        result_df["report"][value["tag"]] = value["report"]

    result_df = result_df.reset_index().rename(columns={ "index": "tag" })

    if view == "scheme":
        scheme = get_scheme(name, stmt)
        if len(scheme):
            view_df = apply_scheme(scheme.iloc[0]["value"], result_df)
        else:
            view_df = result_df
        return {
            "initial": result_df.to_json(orient="records"),
            "view": view_df.to_json(orient="records"),
        }

    return {
        "initial": result_df.to_json(orient="records"),
        "view": None,
    }


def apply_scheme(scheme, rows):
    commands = scheme.strip().split(",")
    commands = map(lambda t: t.strip(), commands)
    commands = filter(lambda t: t != "", commands)
    commands = list(commands)

    for command in commands:
        args = command.split(":")[1].strip().split(" ")
        if command.startswith("combine:"):
            rows = apply_combine_command(args, rows)
        elif command.startswith("percent:"):
            rows = apply_percent_command(args, rows)
        elif command.startswith("less:"):
            rows = apply_less_command(args, rows)
        elif command.startswith("hide:"):
            rows = rows.drop(rows[rows["tag"].isin(args)].index)
    return rows


def apply_combine_command(args, rows):
    facts = rows.set_index('tag').loc[args].reset_index(inplace=False)
    fact0 = facts.iloc[0]
    # Fill all Nan values of the first row with data from other rows
    # Always keep data from the first specified row, if data is available
    # from multiple rows
    for i in range(len(facts) - 1):
        fact0 = fact0.fillna(facts.iloc[i + 1])
    # Remove rows of the given tags
    rows = rows.drop(rows[rows["tag"].isin(args)].index)
    # Add the newly created combined row
    rows = pd.concat([rows, fact0.to_frame().T], ignore_index=True)
    return rows


def apply_less_command(args, rows):
    tag0 = rows[rows["tag"] == args[0]].index[0]
    tag1 = rows[rows["tag"] == args[1]].index[0]

    tag = "less-%s-%s" % (rows.loc[tag0]["tag"], rows.loc[tag1]["tag"])
    data = rows.drop(["tag", "line", "plabel", "report", "uom"], axis=1)
    less = data.loc[tag0] - data.loc[tag1]
    less["tag"] = tag
    less["line"] = rows.loc[tag1]["line"] + 0.1
    less["plabel"] = args[2] if len(args) == 3 else tag
    less["report"] = rows.loc[tag1]["report"]
    less["uom"] = rows.loc[tag0]["uom"]
    return rows.append(less, ignore_index=True)


def apply_percent_command(args, rows):
    tag0 = rows[rows["tag"] == args[0]].index[0]
    tag1 = rows[rows["tag"] == args[1]].index[0]

    tag = "percent-%s-%s" % (rows.loc[tag0]["tag"], rows.loc[tag1]["tag"])
    data = rows.drop(["tag", "line", "plabel", "report", "uom"], axis=1)
    less = data.loc[tag0] / data.loc[tag1]
    less["tag"] = tag
    less["line"] = rows.loc[tag0]["line"] + 0.1
    less["plabel"] = args[2] if len(args) == 3 else tag
    less["report"] = rows.loc[tag0]["report"]
    less["uom"] = "percent"
    return rows.append(less, ignore_index=True)


@app.route("/api/financials/schemes")
def api_show_schemes():
    args = request.args.to_dict()

    df = get_scheme(args["name"], args["stmt"])
    if not len(df):
        return jsonify({ "name": args["name"], "stmt": args["stmt"], "value": ""})
    else:
        return df.iloc[0].to_json()


@app.route("/api/financials/schemes", methods=["POST"])
def api_add_schemes():
    data = request.json
    company = metadata.Company.objects.get(name=data["name"])
    company.schemes[data["stmt"]] = data["value"]
    company.save()
    return jsonify("ok")


@app.route("/api/financials/watchlists")
def api_get_watchlists():
    s = model.watchlists.select()
    conn = model.engine.connect()
    result = conn.execute(s)
    results = [r for r in result]
    df = pd.DataFrame(results, columns=["name", "adsh"])
    df = df.groupby("name").agg(list).reset_index().sort_values(by="name")
    return df.to_json(orient="records")


@app.route("/api/financials/watchlists", methods=["POST"])
def api_add_watchlists():
    data = request.json
    name = data["name"]
    adsh = data["adsh"]
    values = list(map(lambda x: { "name": name, "adsh": x }, adsh))
    conn = model.engine.connect()
    conn.execute(model.watchlists.insert().values(values))
    return jsonify("ok")


@app.route("/api/financials/watchlists/<name>", methods=["DELETE"])
def api_delete_watchlists(name):
    conn = model.engine.connect()
    conn.execute(model.watchlists.delete().where(model.watchlists.c.name == name))
    return jsonify("ok")


@app.route("/api/companies/<name>/submissions", methods=["POST"])
def api_set_submissions(name):
    data = request.json
    company = metadata.Company.objects().get(name=name)
    company.submissions = data["submissions"]
    company.save()
    return jsonify("ok")


@app.route("/api/analysis/<name>/profile")
def api_get_profile(name):
    company = metadata.Company.objects().get(name=name)
    return jsonify(None) if not len(company.profiles) else company.profiles[-1].to_json()


@app.route("/api/analysis/<name>/profile", methods=["POST"])
def api_add_profile(name):
    data = request.json
    company = metadata.Company.objects().get(name=name)
    profile = metadata.Profile(**data)
    company.profiles.append(profile)
    company.save()
    return jsonify("ok")


@app.route("/api/companies")
def api_get_companies():
    companies = metadata.Company.objects().values_list("name")
    return companies.to_json()


@app.route("/api/companies/<name>")
def api_get_company(name):
    company = metadata.Company.objects.get(name=name)
    return company.to_json()


@app.route("/api/companies", methods=["POST"])
def api_add_companies():
    data = request.json
    name = data["name"]
    metadata.Company(name=name).save()
    return jsonify("ok")


@app.route("/api/companies/<name>", methods=["DELETE"])
def api_delete_companies(name):
    metadata.Company.objects(name=name).delete()
    return jsonify("ok")
