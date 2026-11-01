import { formatDateLabel, greetingFor } from '../utils/format'

function PageHeading({ date, firstName }) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{formatDateLabel(date)}</p>
        <h1>{greetingFor(new Date())}, {firstName} <span>✦</span></h1>
        <p className="subtitle">Here’s what’s happening with your team today.</p>
      </div>
      <button className="primary-button" type="button"><span>＋</span> Add employee</button>
    </div>
  )
}

export default PageHeading
