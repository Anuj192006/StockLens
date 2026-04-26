FEATURE_COLUMNS = ["prev_day_return", "ma_5", "ma_10", "rolling_volatility"]


def build_features(df):
    features_df = df.copy()

    daily_return = features_df["close"].pct_change()
    features_df["prev_day_return"] = daily_return.shift(1)
    features_df["ma_5"] = features_df["close"].shift(1).rolling(5).mean()
    features_df["ma_10"] = features_df["close"].shift(1).rolling(10).mean()
    features_df["rolling_volatility"] = daily_return.shift(1).rolling(10).std()

    features_df["next_day_return"] = features_df["close"].shift(-1) / features_df["close"] - 1
    features_df["target"] = (features_df["next_day_return"] > 0).astype(int)

    return features_df.dropna().reset_index(drop=True)
