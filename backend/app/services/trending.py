import requests
import time
from app.services.yahoo import get_stock_info
from app.utils.logo import get_logo_url

from app.database.database import SessionLocal
from app.models.stock import Stock

CACHE = {
    "data": None,
    "expires": 0
}

BASE_URL = (
    "https://query1.finance.yahoo.com/v1/finance/"
    "screener/predefined/saved"
)


def get_screener(scr_id):

    response = requests.get(
        BASE_URL,
        params={
            "scrIds": scr_id,
            "count": 10
        },
        headers={
            "User-Agent": "Mozilla/5.0"
        },
        timeout=10
    )

    response.raise_for_status()

    quotes = response.json()["finance"]["result"][0]["quotes"]

    db = SessionLocal()

    stocks = []

    try:
        ##here
        for quote in quotes:

            symbol = quote.get("symbol")

            stock_db = (
                db.query(Stock)
                .filter(Stock.symbol == symbol)
                .first()
            )

            website = None

            if stock_db and stock_db.website:
                website = stock_db.website

            else:
                try:
                    info = get_stock_info(symbol)

                    if info:
                        website = info.get("website")

                except Exception:
                    website = None

            stocks.append({

                "symbol": symbol,

                "company_name": quote.get("shortName"),

                "price": quote.get("regularMarketPrice"),

                "change": quote.get("regularMarketChange"),

                "change_percent": quote.get("regularMarketChangePercent"),

                "logo_url": get_logo_url(website)
            })
         ##to here
    finally:

        db.close()

    return stocks


def get_trending_stocks():
    try:
        now = time.time()

        if CACHE["data"] and now < CACHE["expires"]:
            return CACHE["data"]

        data = {
            "gainers": get_screener("day_gainers"),
            "losers": get_screener("day_losers"),
            "active": get_screener("most_actives")
        }

        CACHE["data"] = data
        CACHE["expires"] = now + 120

        return data

    except Exception as e:
        print("TRENDING ERROR:", repr(e), flush=True)
        raise