from sklearn.ensemble import RandomForestClassifier

from data import fetch_stock_data, validate_ticker
from features import FEATURE_COLUMNS, build_features


MODEL_STATE = {}


def get_model():
    return RandomForestClassifier(
        n_estimators=120,
        random_state=42,
        min_samples_leaf=2,
    )


def split_time_series(df, train_ratio=0.8):
    split_index = int(len(df) * train_ratio)
    train_df = df.iloc[:split_index].copy()
    test_df = df.iloc[split_index:].copy()
    return train_df, test_df


def train_model_for_ticker(ticker):
    normalized_ticker = validate_ticker(ticker)
    raw_df = fetch_stock_data(normalized_ticker)
    feature_df = build_features(raw_df)
    train_df, test_df = split_time_series(feature_df, train_ratio=0.8)

    model = get_model()
    x_train = train_df[FEATURE_COLUMNS]
    y_train = train_df["target"]
    model.fit(x_train, y_train)

    x_test = test_df[FEATURE_COLUMNS]
    y_test = test_df["target"]
    test_predictions = model.predict(x_test)
    accuracy = (test_predictions == y_test).mean()

    MODEL_STATE[normalized_ticker] = model

    return {
        "message": "Model trained successfully",
        "ticker": normalized_ticker,
        "train_rows": len(train_df),
        "test_rows": len(test_df),
        "test_accuracy": round(float(accuracy), 4),
    }


def predict_latest_for_ticker(ticker):
    normalized_ticker = validate_ticker(ticker)
    if normalized_ticker not in MODEL_STATE:
        raise ValueError(f"Model is not trained for {normalized_ticker}. Call /train?ticker={normalized_ticker} first.")

    raw_df = fetch_stock_data(normalized_ticker, period="3y")
    feature_df = build_features(raw_df)
    latest_row = feature_df.iloc[-1]

    x_latest = latest_row[FEATURE_COLUMNS].to_frame().T
    prediction = int(MODEL_STATE[normalized_ticker].predict(x_latest)[0])
    probabilities = MODEL_STATE[normalized_ticker].predict_proba(x_latest)[0]
    confidence = float(max(probabilities))

    recent_prices = feature_df["close"].tail(45).tolist()

    return {
        "ticker": normalized_ticker,
        "prediction": "UP" if prediction == 1 else "DOWN",
        "confidence": round(confidence, 4),
        "latest_close": round(float(latest_row["close"]), 2),
        "latest_date": str(latest_row["date"]).split(" ")[0],
        "volatility_score": round(float(latest_row["rolling_volatility"]) * 100, 2),
        "recent_prices": [round(float(p), 2) for p in recent_prices],
    }
