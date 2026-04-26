function buildPath(prices, width, height) {
  if (prices.length === 0) {
    return ''
  }

  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const range = maxPrice - minPrice || 1

  return prices
    .map((price, index) => {
      const x = (index / (prices.length - 1 || 1)) * width
      const y = height - ((price - minPrice) / range) * height
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

function PriceChart({ prices, ticker }) {
  const width = 760
  const height = 220
  const linePath = buildPath(prices, width, height)

  if (prices.length < 2) {
    return <div className="empty">Click "Train Model" and "Get Prediction" to load recent prices.</div>
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart" role="img" aria-label={`Recent ${ticker} close prices`}>
      <path d={linePath} fill="none" strokeWidth="3" />
    </svg>
  )
}

export default PriceChart
