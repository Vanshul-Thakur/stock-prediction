
import yfinance as yf
from functools import lru_cache
from fastapi import HTTPException

@lru_cache(maxsize=100)
def get_stock_info(symbol: str):
    try:
        symbol = symbol.upper()
        ticker = yf.Ticker(symbol)

        info = ticker.info

        if not info or not info.get("symbol"):
            return None

        current_price = info.get("currentPrice")
        previous_close = info.get("previousClose")

        change = None
        change_percent = None

        if current_price is not None and previous_close:
            change = round(current_price - previous_close, 2)
            change_percent = round(
                (change / previous_close) * 100, 2
            )

        website = info.get("website")

        if website:
            website = (
                website.replace("https://", "")
                .replace("http://", "")
                .rstrip("/")
            )

        return {
            "symbol": symbol,
            "company_name": info.get("longName"),
            "exchange": info.get("exchange"),
            "sector": info.get("sector"),
            "industry": info.get("industry"),
            "website": website,
            "current_price": current_price,
            "change": change,
            "change_percent": change_percent,
            "market_status": (
                "Open"
                if info.get("marketState") == "REGULAR"
                else "Closed"
            ),
        }

    except Exception as e:
        print(f"Yahoo Finance error for {symbol}: {e}", flush=True)
        raise HTTPException(
            status_code=503,
            detail="Stock data is temporarily unavailable. Please try again later."
        )
