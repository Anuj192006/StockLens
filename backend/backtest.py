from data import fetch_stock_data, validate_ticker
from features import FEATURE_COLUMNS, build_features
from model import get_model, split_time_series


def calculate_backtest_metrics(test_df, predictions):
    total = len(test_df)
    if total == 0:
        raise ValueError("No rows available for backtest.")

    actual = test_df["target"].tolist()
    correct = sum(1 for i in range(total) if predictions[i] == actual[i])
    accuracy = correct / total

    market_returns = test_df["next_day_return"].tolist()
    strategy_returns = []
    for i in range(total):
        if predictions[i] == 1:
            strategy_returns.append(market_returns[i])
        else:
            strategy_returns.append(0.0)

    cumulative_market = 1.0
    cumulative_strategy = 1.0
    for market_return in market_returns:
        cumulative_market *= 1 + market_return
    for strategy_return in strategy_returns:
        cumulative_strategy *= 1 + strategy_return

    return {
        "accuracy": round(accuracy, 4),
        "total_predictions": total,
        "correct_predictions": correct,
        "strategy_return_pct": round((cumulative_strategy - 1) * 100, 2),
        "market_return_pct": round((cumulative_market - 1) * 100, 2),
    }


def run_backtest_for_ticker(ticker):
    normalized_ticker = validate_ticker(ticker)
    raw_df = fetch_stock_data(normalized_ticker)
    feature_df = build_features(raw_df)
    train_df, test_df = split_time_series(feature_df, train_ratio=0.8)

    model = get_model()
    x_train = train_df[FEATURE_COLUMNS]
    y_train = train_df["target"]
    model.fit(x_train, y_train)

    x_test = test_df[FEATURE_COLUMNS]
    predictions = model.predict(x_test).tolist()
    metrics = calculate_backtest_metrics(test_df, predictions)

    return {
        "message": "Backtest completed",
        "ticker": normalized_ticker,
        "from_date": str(test_df.iloc[0]["date"]).split(" ")[0],
        "to_date": str(test_df.iloc[-1]["date"]).split(" ")[0],
        **metrics,
    }
