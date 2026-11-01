import { formatTime } from '../utils/format'

function QuickSummaryPanel({ stats, summary }) {
  return (
    <article className="panel activity-panel">
      <div className="panel-heading"><div><h2>Quick summary</h2><p>Team activity at a glance</p></div><button className="more-button" type="button" aria-label="More summary options">···</button></div>
      <div className="summary-list">
        <div className="summary-item"><span className="summary-icon purple">♙</span><div><strong>{summary.employees} employees</strong><small>Across {summary.departments} departments</small></div><span className="summary-arrow">→</span></div>
        <div className="summary-item"><span className="summary-icon green">✓</span><div><strong>{summary.checkedIn} checked in</strong><small>Last check-in at {formatTime(summary.lastCheckIn)}</small></div><span className="summary-arrow">→</span></div>
        <div className="summary-item"><span className="summary-icon orange">◷</span><div><strong>{summary.needAttention} need attention</strong><small>Late arrivals today</small></div><span className="summary-arrow">→</span></div>
      </div>
      <div className="tip"><span>✦</span><p><b>Looking good!</b><br />Your attendance rate is {stats.attendanceRate}% today.</p></div>
    </article>
  )
}

export default QuickSummaryPanel
