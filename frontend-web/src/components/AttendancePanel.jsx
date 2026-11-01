import { STATUS_LABELS, formatTime, statusClass } from '../utils/format'

function AttendancePanel({ attendance, totalEmployees }) {
  return (
    <article className="panel attendance-panel" id="attendance">
      <div className="panel-heading">
        <div><h2>Today’s attendance</h2><p>Live overview of your team</p></div>
        <button className="text-button" type="button">View all <span>→</span></button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>EMPLOYEE</th><th>CHECK-IN</th><th>STATUS</th><th /></tr></thead>
          <tbody>
            {attendance.length === 0 ? (
              <tr><td className="empty-row" colSpan={4}>No attendance recorded for today.</td></tr>
            ) : attendance.map((person) => (
              <tr key={person.id}>
                <td><div className="person"><div className={`avatar avatar-${person.color}`}>{person.initials}</div><div><strong>{person.name}</strong><small>{person.role}</small></div></div></td>
                <td className="time">{formatTime(person.checkIn)}</td>
                <td><span className={`status ${statusClass(person.status)}`}><i />{STATUS_LABELS[person.status] || person.status}</span></td>
                <td><button className="row-menu" type="button" aria-label={`More options for ${person.name}`}>···</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">Showing <b>{attendance.length}</b> of <b>{totalEmployees}</b> employees <button type="button" aria-label="Next page">→</button></div>
    </article>
  )
}

export default AttendancePanel
