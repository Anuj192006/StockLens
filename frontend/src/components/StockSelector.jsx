function StockSelector({ tickers, selectedTicker, onChange, disabled }) {
  return (
    <div className="selector-wrap">
      <label htmlFor="ticker-select">Stock</label>
      <select id="ticker-select" value={selectedTicker} onChange={onChange} disabled={disabled}>
        {tickers.map((ticker) => (
          <option key={ticker} value={ticker}>
            {ticker}
          </option>
        ))}
      </select>
    </div>
  )
}

export default StockSelector
