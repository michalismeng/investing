import requests
from bs4 import BeautifulSoup

def cik_lookup(ticker):
    """Lookup a CIK number by ticker symbol."""
    header = { "User-Agent": ("Mozilla/5.0 (X11; Linux x86_64)"
                              " AppleWebKit/537.36(KHTML, like Gecko)"
                              " Chrome/95.0.4638.54 Safari/537.36") }
    result = requests.get("https://sec.report/Ticker/%s" % ticker,
                          headers=header)
    if result.status_code != 200:
        return None
    soup = BeautifulSoup(result.text, "html.parser")
    text = soup.get_text(separator="\n")
    words = text.split()
    for i, _ in enumerate(words):
        # Match "SEC CIK <CIK>
        if i + 2 < len(words):
            if words[i].strip() == "SEC" and words[i + 1] == "CIK":
                return words[i + 2]

def get_filings_url(ticker):
    """Get URL of the filings page by ticker symbol."""
    cik = cik_lookup(ticker)
    if cik is None:
        return None
    return "https://www.sec.gov/edgar/browse/?CIK=%s" % cik

