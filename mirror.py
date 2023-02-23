import pandas as pd
from pprint import pprint
import argparse
from bs4 import BeautifulSoup
from urllib.request import Request, urlopen
from urllib.parse import urljoin
import zipfile
from io import BytesIO
import os

base_url = 'https://www.sec.gov/dera/data/financial-statement-data-sets'

parser = argparse.ArgumentParser(description='Download XBRL datasets from the official SEC website: %s' % base_url)
parser.add_argument('--list', action="store_true", help='list available XBRL datasets')
parser.add_argument('--dataset', metavar="DATASET", help='mirror the given dataset')

args = parser.parse_args()

req = Request(base_url, headers={'User-Agent': 'Mozilla/5.0'})
html_page = urlopen(req).read()

soup = BeautifulSoup(html_page, 'html.parser')
df = pd.DataFrame([], columns=["dataset", "link"])
for link in soup.select('table.list a'):
    href = link.get("href")
    ds = href.split("/")[-1].split(".")[0]
    df = pd.concat([df, pd.DataFrame([[ds, href]], columns=["dataset", "link"])])

if args.list:
    pprint(df.sort_values(by="dataset"))

if args.dataset:
    ds = args.dataset
    entries = df[df["dataset"] == ds]
    if len(entries) == 0:
        raise Exception("No dataset found: '%s'" % ds)

    print("Downloading dataset '%s'..." % ds)
    href = entries.iloc[0]["link"]
    url = urljoin(base_url, href)
    response = urlopen(url)
    data = response.read()

    print("Extracting dataset...")
    zip = zipfile.ZipFile(BytesIO(data))
    zip.extractall(os.path.join("data/", ds))
