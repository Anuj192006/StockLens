import pandas as pd
import yfinance as yf


SUPPORTED_TICKERS = ["AAPL", "MSFT", "TSLA", "NVDA", "GOOG", "^GSPC"]


def get_supported_tickers():
    return SUPPORTED_TICKERS


def normalize_ticker(ticker):
    return ticker.strip().upper()


def validate_ticker(ticker):
    normalized = normalize_ticker(ticker)
    if normalized not in SUPPORTED_TICKERS:
        raise ValueError(f"Unsupported ticker '{ticker}'. Use one of: {', '.join(SUPPORTED_TICKERS)}")
    return normalized


def fetch_stock_data(ticker, period="15y", interval="1d"):
    normalized_ticker = validate_ticker(ticker)

    df = yf.download(normalized_ticker, period=period, interval=interval, auto_adjust=True, progress=False)
    if df.empty:
        raise ValueError(f"No data returned for ticker {normalized_ticker}.")

    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    df = df.reset_index()
    df.columns = [str(col).lower() for col in df.columns]
    df["ticker"] = normalized_ticker
    return df
