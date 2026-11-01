import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsAPI } from '../api/settings'
import { PERMISSIONS } from '../constants/permissions'
import { getUser } from '../utils/auth'
import { can } from '../utils/permissions'
import { formatDateShort } from '../utils/forms'
import PageHeader from '../components/PageHeader'
import Notice from '../components/Notice'
import Loading from '../components/Loading'

const TOGGLES = [
  { name: 'gpsEnabled', label: 'GPS check-in', detail: 'Allow check-ins within office geo-fences.' },
  { name: 'qrEnabled', label: 'QR check-in', detail: 'Let employees scan a QR code on site.' },
  { name: 'manualEnabled', label: 'Manual attendance', detail: 'Allow HR to mark attendance manually.' },
  { name: 'lateAlertsEnabled', label: 'Late alerts', detail: 'Notify managers about late arrivals.' },
  { name: 'leaveEnabled', label: 'Leave requests', detail: 'Enable time-off applications.' },
  { name: 'checkoutReminderEnabled', label: 'Checkout reminders', detail: 'Remind employees to check out.' },
]

const EMPTY = {
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  companyAddress: '',
  graceMinutes: 10,
  gpsEnabled: true,
  qrEnabled: true,
  manualEnabled: true,
  lateAlertsEnabled: true,
  leaveEnabled: true,
  checkoutReminderEnabled: true,
  plan: 'Business',
  employeeLimit: 100,
  renewalDate: '',
}

function Settings() {
  const user = getUser()
  const queryClient = useQueryClient()
  const [form, setForm] = useState(EMPTY)
  const [meta, setMeta] = useState({ employeeCount: 0, employeeLimit: 100 })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: () => settingsAPI.get() })

  useEffect(() => {
    if (!settingsQuery.data) return
    const settings = settingsQuery.data
    setForm({
      companyName: settings.companyName || '',
      companyEmail: settings.companyEmail || '',
      companyPhone: settings.companyPhone || '',
      companyAddress: settings.companyAddress || '',
      graceMinutes: settings.graceMinutes ?? 10,
      gpsEnabled: settings.gpsEnabled !== false,
      qrEnabled: settings.qrEnabled !== false,
      manualEnabled: settings.manualEnabled !== false,
      lateAlertsEnabled: settings.lateAlertsEnabled !== false,
      leaveEnabled: settings.leaveEnabled !== false,
      checkoutReminderEnabled: settings.checkoutReminderEnabled !== false,
      plan: settings.plan || 'Business',
      employeeLimit: settings.employeeLimit ?? 100,
      renewalDate: settings.renewalDate ? settings.renewalDate.slice(0, 10) : '',
    })
    setMeta({
      employeeCount: settings.employeeCount || 0,
      employeeLimit: settings.employeeLimit || 100,
    })
  }, [settingsQuery.data])

  const updateMutation = useMutation({
    mutationFn: settingsAPI.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      setMeta({
        employeeCount: data.employeeCount || 0,
        employeeLimit: data.employeeLimit || 100,
      })
      setError('')
      setMessage('Settings saved.')
    },
    onError: (err) => setError(err.response?.data?.message || 'Could not save settings.'),
  })

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    updateMutation.mutate({
      ...form,
      graceMinutes: Number(form.graceMinutes),
      employeeLimit: Number(form.employeeLimit),
      renewalDate: form.renewalDate || null,
    })
  }

  const canUpdate = can(user, 'settings', PERMISSIONS.canUpdate)
  const usage = meta.employeeLimit
    ? Math.min(100, Math.round((meta.employeeCount / meta.employeeLimit) * 100))
    : 0

  if (settingsQuery.isLoading) return <Loading text="Loading settings..." />
  if (settingsQuery.isError) {
    return (
      <div className="inline-error">
        {settingsQuery.error?.response?.data?.message || 'Unable to load settings.'}
      </div>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="WORKSPACE"
        title="Settings"
        subtitle="Manage company details, attendance rules and your subscription."
      />

      <Notice type="error">{error}</Notice>
      <Notice type="success">{message}</Notice>

      <form onSubmit={handleSubmit} className="settings-layout">
        <section className="settings-main">
          <article className="panel form-panel">
            <div className="panel-heading">
              <div>
                <h2>Company profile</h2>
                <p>Shown on reports, notifications and employee portals.</p>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="companyName">Company name</label>
                <input
                  id="companyName"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="companyEmail">Company email</label>
                <input
                  id="companyEmail"
                  name="companyEmail"
                  type="email"
                  value={form.companyEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="companyPhone">Phone</label>
                <input
                  id="companyPhone"
                  name="companyPhone"
                  value={form.companyPhone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="companyAddress">Address</label>
                <input
                  id="companyAddress"
                  name="companyAddress"
                  value={form.companyAddress}
                  onChange={handleChange}
                />
              </div>
            </div>
          </article>

          <article className="panel form-panel">
            <div className="panel-heading">
              <div>
                <h2>Attendance rules</h2>
                <p>Define how check-ins are captured and when arrivals count as late.</p>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="graceMinutes">Grace period (minutes)</label>
                <input
                  id="graceMinutes"
                  name="graceMinutes"
                  type="number"
                  min="0"
                  max="240"
                  value={form.graceMinutes}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="toggle-list">
              {TOGGLES.map((toggle) => (
                <label className="toggle-row" key={toggle.name}>
                  <span>
                    <strong>{toggle.label}</strong>
                    <small>{toggle.detail}</small>
                  </span>
                  <input
                    type="checkbox"
                    name={toggle.name}
                    checked={form[toggle.name]}
                    onChange={handleChange}
                  />
                </label>
              ))}
            </div>
          </article>
        </section>

        <aside className="settings-side">
          <article className="panel form-panel">
            <div className="panel-heading">
              <div>
                <h2>Subscription</h2>
                <p>Your current Shiftly plan and usage.</p>
              </div>
            </div>
            <div className="plan-badge">{form.plan}</div>
            <div className="usage">
              <div className="progress-label">
                <span>Employee usage</span>
                <strong>
                  {meta.employeeCount} / {meta.employeeLimit}
                </strong>
              </div>
              <div className="progress large">
                <span style={{ width: `${usage}%` }} />
              </div>
            </div>
            <div className="form-grid single">
              <div className="form-group">
                <label htmlFor="plan">Plan</label>
                <select id="plan" name="plan" value={form.plan} onChange={handleChange}>
                  <option value="Starter">Starter</option>
                  <option value="Business">Business</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="employeeLimit">Employee limit</label>
                <input
                  id="employeeLimit"
                  name="employeeLimit"
                  type="number"
                  min="1"
                  value={form.employeeLimit}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="renewalDate">Renewal date</label>
                <input
                  id="renewalDate"
                  name="renewalDate"
                  type="date"
                  value={form.renewalDate}
                  onChange={handleChange}
                />
              </div>
            </div>
            <p className="side-note">
              {form.renewalDate
                ? `Renews on ${formatDateShort(form.renewalDate)}`
                : 'No renewal date set'}
            </p>
          </article>

          {canUpdate && (
            <button className="primary-button full-button" type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving settings...' : 'Save settings'}
            </button>
          )}
        </aside>
      </form>
    </>
  )
}

export default Settings
