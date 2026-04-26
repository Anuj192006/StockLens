function MetricCard({ title, value, subtitle, tone = 'neutral', compact = false }) {
  return (
    <article className={`card ${tone} ${compact ? 'compact' : ''}`}>
      <p className="card-title">{title}</p>
      <h3 className="card-value">{value}</h3>
      <p className="card-subtitle">{subtitle}</p>
    </article>
  )
}

export default MetricCard
