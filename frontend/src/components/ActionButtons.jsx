function ActionButtons({ loadingAction, onTrain, onPredict, onBacktest, disabled }) {
  const isDisabled = disabled || loadingAction !== ''

  return (
    <div className="actions">
      <button onClick={onTrain} disabled={isDisabled}>
        {loadingAction === 'train' ? 'Training...' : 'Train Model'}
      </button>
      <button onClick={onPredict} disabled={isDisabled}>
        {loadingAction === 'predict' ? 'Loading...' : 'Get Prediction'}
      </button>
      <button onClick={onBacktest} disabled={isDisabled}>
        {loadingAction === 'backtest' ? 'Running...' : 'Run Backtest'}
      </button>
    </div>
  )
}

export default ActionButtons
