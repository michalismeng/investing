import pandas as pd
from tqdm import tqdm
from model import facts, engine
import argparse

parser = argparse.ArgumentParser(description='Process financial data from EDGAR SEC')
parser.add_argument('--folder', required=True,
                    help='the folder containing the data files')

args = parser.parse_args()
folder = args.folder

print("Processing folder %s" % folder)

def gather_numbers_for(adsh, pre, num):
    # There might be duplicate tags for a specific submission, e.g., if they appear in different lines of the IS. Check 2020q1 - CODA OCTOPUS GROUP, INC.
    # These duplicates cause duplicate number entries when merging. Drop those duplicates.
    
    # Each row in NUM is linked to perhaps multiple rows in PRE. We want all appearences in PRE where the stmt is unique
    tags = pre[(pre["adsh"] == adsh) & (pre["stmt"].isin(["IS", "BS", "CF"]))].drop_duplicates(keep="first", subset=["tag", "adsh", "stmt"])
    numbers = num[(num["adsh"] == adsh) & (num["tag"].isin(tags["tag"]))]
    numbers_latest = numbers.loc[numbers.groupby("tag")["ddate"].idxmax()]
    numbers_of_interest = numbers_latest.reset_index()[["adsh", "tag", "version", "ddate", "qtrs", "uom", "value"]]
    return pd.merge(numbers_of_interest, tags[["tag", "plabel", "report", "line", "stmt", "adsh"]], on=["adsh", "tag"], how="inner")

sub = pd.read_csv("%s/sub.txt" % folder, delimiter="\t")
pre = pd.read_csv("%s/pre.txt" % folder, delimiter="\t")
num = pd.read_csv("%s/num.txt" % folder, delimiter="\t")

entries = sub[sub["fp"] == "FY"]
print("Found %s entries" % len(entries))

data = []

for idx, entry in tqdm(entries.iterrows()):
    numbers = gather_numbers_for(entry["adsh"], pre, num)
    numbers["adsh"] = entry["adsh"]
    numbers["name"] = entry["name"]
    numbers["cik"] = entry["cik"]
    data.append(numbers)

data = pd.concat(data)

print("Creating pickle file")
data.to_pickle("%s/data.pickle" % folder)

dicts = []
for idx, entry in data.iterrows():
    dicts.append(entry.to_dict())

print("Writing to database")
conn = engine.connect()
conn.execute(facts.insert(), dicts)
conn.close()
