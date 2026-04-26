from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from backtest import run_backtest_for_ticker
from data import get_supported_tickers
from model import predict_latest_for_ticker, train_model_for_ticker


app = FastAPI(title="StockLens Pro API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "StockLens Pro API"}


@app.get("/stocks")
def stocks():
    return {"tickers": get_supported_tickers()}


@app.get("/train")
def train(ticker: str = Query(...)):
    try:
        return train_model_for_ticker(ticker)
    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error))


@app.get("/predict")
def predict(ticker: str = Query(...)):
    try:
        return predict_latest_for_ticker(ticker)
    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error))


@app.get("/backtest")
def backtest(ticker: str = Query(...)):
    try:
        return run_backtest_for_ticker(ticker)
    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error))
