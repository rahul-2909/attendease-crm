function StatsSection({ stats }) {
  const progress = stats.totalEmployees
    ? Math.min((stats.present / stats.totalEmployees) * 100, 100)
    : 0

  return (
    <section className="stats" aria-label="Today's attendance summary">
      <article className="stat-card">
        <div className="stat-top"><span>Present today</span><span className="stat-icon mint">✓</span></div>
        <strong>{stats.present} <small>/ {stats.totalEmployees}</small></strong>
        <div className="stat-foot"><span className="positive">{stats.attendanceRate}%</span> of workforce</div>
        <div className="progress"><span style={{ width: `${progress}%` }} /></div>
      </article>
      <article className="stat-card">
        <div className="stat-top"><span>Late arrivals</span><span className="stat-icon amber">◷</span></div>
        <strong>{stats.lateArrivals}</strong>
        <div className="stat-foot">{stats.lateArrivals === 0 ? 'No late arrivals today' : 'Requires follow-up'}</div>
        <div className="mini-bars"><i /><i /><i /><i /><i /><i /><i /></div>
      </article>
      <article className="stat-card">
        <div className="stat-top"><span>On leave</span><span className="stat-icon lavender">✳</span></div>
        <strong>{stats.onLeave}</strong>
        <div className="stat-foot">Across <b>{stats.departments}</b> departments</div>
        <div className="department-dots"><i /><i /><i /><span>+{stats.departments} dept</span></div>
      </article>
      <article className="stat-card">
        <div className="stat-top"><span>Attendance rate</span><span className="stat-icon sky">↗</span></div>
        <strong>{stats.attendanceRate}<small>%</small></strong>
        <div className="stat-foot">Based on <b>{stats.present}</b> check-ins</div>
        <div className="sparkline" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
      </article>
    </section>
  )
}

export default StatsSection
