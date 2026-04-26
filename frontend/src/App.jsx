import { useEffect, useState } from 'react'
import { getBacktestForTicker, getPredictionForTicker, getStocks, trainModelForTicker } from './api'
import ActionButtons from './components/ActionButtons'
import MetricCard from './components/MetricCard'
import PriceChart from './components/PriceChart'
import StockSelector from './components/StockSelector'
import './styles.css'

function formatPercent(value, scale = 1) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return 'N/A'
  }
  return `${(numericValue * scale).toFixed(2)}%`
}

function formatCurrency(value) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return 'N/A'
  }
  return `$${numericValue.toFixed(2)}`
}

function App() {
  const [tickers, setTickers] = useState([])
  const [selectedTicker, setSelectedTicker] = useState('AAPL')
  const [prediction, setPrediction] = useState(null)
  const [trainSummary, setTrainSummary] = useState(null)
  const [backtestSummary, setBacktestSummary] = useState(null)
  const [loadingAction, setLoadingAction] = useState('')
  const [isLoadingStocks, setIsLoadingStocks] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStocks()
  }, [])

  async function loadStocks() {
    setError('')
    setIsLoadingStocks(true)
    try {
      const response = await getStocks()
      const availableTickers = response.data.tickers || []
      setTickers(availableTickers)
      if (availableTickers.length > 0) {
        setSelectedTicker(availableTickers[0])
      }
    } catch (apiError) {
      setError(apiError.response?.data?.detail || 'Failed to load supported stocks.')
    } finally {
      setIsLoadingStocks(false)
    }
  }

  function handleTickerChange(event) {
    setSelectedTicker(event.target.value)
    setPrediction(null)
    setTrainSummary(null)
    setBacktestSummary(null)
    setError('')
  }

  async function handleTrain() {
    setError('')
    setLoadingAction('train')
    try {
      const response = await trainModelForTicker(selectedTicker)
      setTrainSummary(response.data)
    } catch (apiError) {
      setError(apiError.response?.data?.detail || 'Failed to train model.')
    } finally {
      setLoadingAction('')
    }
  }

  async function handlePredict() {
    setError('')
    setLoadingAction('predict')
    try {
      const response = await getPredictionForTicker(selectedTicker)
      setPrediction(response.data)
    } catch (apiError) {
      setError(apiError.response?.data?.detail || 'Failed to get prediction.')
    } finally {
      setLoadingAction('')
    }
  }

  async function handleBacktest() {
    setError('')
    setLoadingAction('backtest')
    try {
      const response = await getBacktestForTicker(selectedTicker)
      setBacktestSummary(response.data)
    } catch (apiError) {
      setError(apiError.response?.data?.detail || 'Failed to run backtest.')
    } finally {
      setLoadingAction('')
    }
  }

  const currentPrediction = prediction ? prediction.prediction : 'N/A'
  const modelAccuracy = backtestSummary
    ? formatPercent(backtestSummary.accuracy, 100)
    : trainSummary
      ? formatPercent(trainSummary.test_accuracy, 100)
      : 'N/A'
  const backtestReturn = backtestSummary ? formatPercent(backtestSummary.strategy_return_pct) : 'N/A'
  const volatilityScore = prediction ? formatPercent(prediction.volatility_score) : 'N/A'

  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">
          <p className="brand-kicker">Market Intelligence</p>
          <h1>StockLens Pro</h1>
        </div>
        <StockSelector
          tickers={tickers}
          selectedTicker={selectedTicker}
          onChange={handleTickerChange}
          disabled={isLoadingStocks || loadingAction !== ''}
        />
      </nav>

      {error ? <div className="error-banner">{error}</div> : null}

      <main className="dashboard">
        <section className="metrics-grid">
          <MetricCard
            title="Current Prediction"
            value={currentPrediction}
            subtitle={prediction ? `Confidence ${formatPercent(prediction.confidence, 100)}` : 'Run prediction to update'}
            tone={currentPrediction === 'UP' ? 'positive' : currentPrediction === 'DOWN' ? 'negative' : 'neutral'}
          />
          <MetricCard title="Model Accuracy" value={modelAccuracy} subtitle="Backtest or validation accuracy" />
          <MetricCard title="Backtest Return" value={backtestReturn} subtitle="Strategy return over test window" />
          <MetricCard title="Volatility Score" value={volatilityScore} subtitle="10-day rolling volatility" />
        </section>

        <section className="action-panel">
          <div>
            <h2>Model Actions</h2>
            <p>Train and evaluate {selectedTicker} with one-click controls.</p>
          </div>
          <ActionButtons
            loadingAction={loadingAction}
            onTrain={handleTrain}
            onPredict={handlePredict}
            onBacktest={handleBacktest}
            disabled={isLoadingStocks || tickers.length === 0}
          />
        </section>

        <section className="visual-panel">
          <div className="panel-head">
            <h2>Trend Preview</h2>
            <p>Recent close prices for {selectedTicker}</p>
          </div>
          <PriceChart prices={prediction?.recent_prices || []} ticker={selectedTicker} />
        </section>

        <section className="stats-strip">
          <div className="stat-item">
            <span className="stat-label">Ticker</span>
            <span className="stat-value">{selectedTicker}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Latest Close</span>
            <span className="stat-value">{prediction ? formatCurrency(prediction.latest_close) : 'N/A'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Test Window</span>
            <span className="stat-value">{backtestSummary ? `${backtestSummary.from_date} to ${backtestSummary.to_date}` : 'N/A'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Predictions</span>
            <span className="stat-value">{backtestSummary ? backtestSummary.total_predictions : 'N/A'}</span>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span className="status-dot" />
        Live Market Data via yfinance
      </footer>
    </div>
  )
}

export default App
