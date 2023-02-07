import pandas as pd
from flask import *
import os
import model

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


@app.route("/api/financials")
def api_show_financial_data():

    adsh = request.args.getlist('adsh[]')
    stmt = request.args.get('stmt')

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
    return result_df.to_json(orient="records")


@app.route("/api/financials/schemes")
def api_show_schemes():
    args = request.args.to_dict()

    s = model.schemes.select().where((model.schemes.c.name == args["name"]) & (model.schemes.c.stmt == args["stmt"]))
    conn = model.engine.connect()
    result = conn.execute(s)
    results = [r for r in result]
    df = pd.DataFrame(results, columns=["name", "stmt", "value"])
    if not len(df):
        return jsonify({ "name": args["name"], "stmt": args["stmt"], "value": ""})
    else:
        return df.iloc[0].to_json()


@app.route("/api/financials/schemes", methods=["POST"])
def api_add_schemes():
    data = request.json

    s = model.schemes.select().where((model.schemes.c.name == data["name"]) & (model.schemes.c.stmt == data["stmt"]))
    conn = model.engine.connect()
    result = conn.execute(s)
    results = [r for r in result]
    df = pd.DataFrame(results, columns=["name", "stmt", "value"])
    if not len(df):
        value = { "name": data["name"], "stmt": data["stmt"], "value": data["value"] }
        conn.execute(model.schemes.insert(), value)
        return jsonify("ok")
    else:
        conn.execute(model.schemes.update().where((model.schemes.c.name == data["name"]) & (model.schemes.c.stmt == data["stmt"])).values(value=data["value"]))
        return jsonify("ok")