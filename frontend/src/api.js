import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 30000,
})

export function getStocks() {
  return apiClient.get('/stocks')
}

export function trainModelForTicker(ticker) {
  return apiClient.get('/train', { params: { ticker } })
}

export function getPredictionForTicker(ticker) {
  return apiClient.get('/predict', { params: { ticker } })
}

export function getBacktestForTicker(ticker) {
  return apiClient.get('/backtest', { params: { ticker } })
}
