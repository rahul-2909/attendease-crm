import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { leaveAPI } from '../api/leave'
import { PERMISSIONS } from '../constants/permissions'
import { getUser } from '../utils/auth'
import { can } from '../utils/permissions'
import { getInitials } from '../utils/format'
import { formatDateShort, todayISO } from '../utils/forms'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import Notice from '../components/Notice'
import Loading from '../components/Loading'

const TYPES = ['ANNUAL', 'SICK', 'CASUAL', 'UNPAID', 'OTHER']
const TYPE_LABELS = {
  ANNUAL: 'Annual leave',
  SICK: 'Sick leave',
  CASUAL: 'Casual leave',
  UNPAID: 'Unpaid leave',
  OTHER: 'Other',
}
const TEAM_ROLES = ['SUPER_ADMIN', 'COMPANY_OWNER', 'HR_ADMIN', 'MANAGER']

const STATUS_CLASS = {
  PENDING: 'status-late',
  APPROVED: 'status-present',
  REJECTED: 'status-absent',
  CANCELLED: 'status-leave',
}

const dayCount = (from, to) => {
  if (!from || !to) return 0
  const start = new Date(from)
  const end = new Date(to)
  return Math.max(1, Math.round((end - start) / 86400000) + 1)
}

function Leave() {
  const user = getUser()
  const queryClient = useQueryClient()
  const isTeamView = TEAM_ROLES.includes(user?.role)

  const [statusFilter, setStatusFilter] = useState('')
  const [applyOpen, setApplyOpen] = useState(false)
  const [reviewing, setReviewing] = useState(null)
  const [reviewForm, setReviewForm] = useState({ status: 'APPROVED', reviewNote: '' })
  const [form, setForm] = useState({
    type: 'ANNUAL',
    startDate: todayISO(),
    endDate: todayISO(),
    reason: '',
  })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const params = { status: statusFilter || undefined }
  const leavesQuery = useQuery({
    queryKey: ['leave', params],
    queryFn: () => leaveAPI.list(params),
  })
  const leaves = leavesQuery.data || []

  const stats = useMemo(
    () => ({
      pending: leaves.filter((leave) => leave.status === 'PENDING').length,
      approved: leaves.filter((leave) => leave.status === 'APPROVED').length,
      rejected: leaves.filter((leave) => leave.status === 'REJECTED').length,
      cancelled: leaves.filter((leave) => leave.status === 'CANCELLED').length,
    }),
    [leaves]
  )

  const applyMutation = useMutation({
    mutationFn: leaveAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] })
      setApplyOpen(false)
      setForm({ type: 'ANNUAL', startDate: todayISO(), endDate: todayISO(), reason: '' })
      setError('')
      setMessage('Leave request submitted.')
    },
    onError: (err) => setError(err.response?.data?.message || 'Could not submit leave request.'),
  })

  const reviewMutation = useMutation({
    mutationFn: ({ id, payload }) => leaveAPI.review(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] })
      setReviewing(null)
      setError('')
      setMessage('Leave request reviewed.')
    },
    onError: (err) => setError(err.response?.data?.message || 'Could not review leave request.'),
  })

  const cancelMutation = useMutation({
    mutationFn: leaveAPI.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] })
      setMessage('Leave request cancelled.')
    },
    onError: (err) => setError(err.response?.data?.message || 'Could not cancel leave request.'),
  })

  const deleteMutation = useMutation({
    mutationFn: leaveAPI.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] })
      setMessage('Leave request deleted.')
    },
    onError: (err) => setError(err.response?.data?.message || 'Could not delete leave request.'),
  })

  const openApply = () => {
    setError('')
    setMessage('')
    setApplyOpen(true)
  }

  const openReview = (leave) => {
    setError('')
    setMessage('')
    setReviewing(leave)
    setReviewForm({ status: 'APPROVED', reviewNote: '' })
  }

  const submitApply = (event) => {
    event.preventDefault()
    applyMutation.mutate(form)
  }

  const submitReview = (event) => {
    event.preventDefault()
    reviewMutation.mutate({ id: reviewing._id, payload: reviewForm })
  }

  const handleDelete = (leave) => {
    if (window.confirm('Delete this leave request permanently?')) {
      deleteMutation.mutate(leave._id)
    }
  }

  const canApply = can(user, 'leave', PERMISSIONS.canCreate)
  const canUpdate = can(user, 'leave', PERMISSIONS.canUpdate)
  const canDelete = can(user, 'leave', PERMISSIONS.canDelete)

  return (
    <>
      <PageHeader
        eyebrow="TIME OFF"
        title="Leave"
        subtitle="Apply for time off and review your team's leave requests."
        action={
          canApply ? (
            <button className="primary-button" type="button" onClick={openApply}>
              <span>＋</span> Request leave
            </button>
          ) : null
        }
      />

      <Notice type="error">{error}</Notice>
      <Notice type="success">{message}</Notice>

      <section className="mini-stats">
        <div className="mini-stat">
          <span>Pending</span>
          <strong>{stats.pending}</strong>
        </div>
        <div className="mini-stat">
          <span>Approved</span>
          <strong>{stats.approved}</strong>
        </div>
        <div className="mini-stat">
          <span>Rejected</span>
          <strong>{stats.rejected}</strong>
        </div>
        <div className="mini-stat">
          <span>Cancelled</span>
          <strong>{stats.cancelled}</strong>
        </div>
      </section>

      <section className="panel flat-panel">
        <div className="toolbar">
          <select
            className="compact-input"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {leavesQuery.isLoading ? (
          <Loading text="Loading leave requests..." />
        ) : leavesQuery.isError ? (
          <div className="inline-error">
            {leavesQuery.error?.response?.data?.message || 'Unable to load leave requests.'}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>TYPE</th>
                  <th>DATES</th>
                  <th>DAYS</th>
                  <th>REASON</th>
                  <th>STATUS</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td className="empty-row" colSpan={7}>
                      No leave requests found.
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>
                        <div className="person">
                          <div className={`avatar avatar-${leave.employeeId?.color || 'violet'}`}>
                            {leave.employeeId?.initials ||
                              getInitials(leave.employeeId?.name || '')}
                          </div>
                          <div>
                            <strong>{leave.employeeId?.name || 'Employee'}</strong>
                            <small>{leave.employeeId?.role || 'Team member'}</small>
                          </div>
                        </div>
                      </td>
                      <td>{TYPE_LABELS[leave.type] || leave.type}</td>
                      <td className="muted">
                        {formatDateShort(leave.startDate)} – {formatDateShort(leave.endDate)}
                      </td>
                      <td>{dayCount(leave.startDate, leave.endDate)}</td>
                      <td className="muted truncated">{leave.reason || '—'}</td>
                      <td>
                        <span className={`status ${STATUS_CLASS[leave.status] || 'status-leave'}`}>
                          <i />
                          {leave.status}
                        </span>
                      </td>
                      <td className="row-actions">
                        {isTeamView && canUpdate && leave.status === 'PENDING' && (
                          <button
                            className="text-button"
                            type="button"
                            onClick={() => openReview(leave)}
                          >
                            Review
                          </button>
                        )}
                        {canUpdate && leave.status === 'PENDING' && (
                          <button
                            className="text-button"
                            type="button"
                            onClick={() => cancelMutation.mutate(leave._id)}
                          >
                            Cancel
                          </button>
                        )}
                        {canDelete && (
                          <button
                            className="text-button danger"
                            type="button"
                            onClick={() => handleDelete(leave)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">
          Showing <b>{leaves.length}</b> requests
        </div>
      </section>

      <Modal
        open={applyOpen}
        title="Request leave"
        subtitle="Tell us when you'll be away so the team can plan ahead."
        onClose={() => setApplyOpen(false)}
      >
        <form className="form-grid" onSubmit={submitApply}>
          <div className="form-group">
            <label htmlFor="leave-type">Leave type</label>
            <select
              id="leave-type"
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value })}
            >
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="leave-start">Start date</label>
            <input
              id="leave-start"
              type="date"
              value={form.startDate}
              onChange={(event) => setForm({ ...form, startDate: event.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="leave-end">End date</label>
            <input
              id="leave-end"
              type="date"
              min={form.startDate}
              value={form.endDate}
              onChange={(event) => setForm({ ...form, endDate: event.target.value })}
              required
            />
          </div>
          <div className="form-group full-span">
            <label htmlFor="leave-reason">Reason</label>
            <textarea
              id="leave-reason"
              rows="3"
              value={form.reason}
              onChange={(event) => setForm({ ...form, reason: event.target.value })}
              placeholder="Add context for your manager"
            />
          </div>
          <div className="form-actions full-span">
            <button type="button" className="ghost-button" onClick={() => setApplyOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={applyMutation.isPending}>
              {applyMutation.isPending ? 'Submitting...' : 'Submit request'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(reviewing)}
        title="Review leave request"
        subtitle={reviewing ? `${reviewing.employeeId?.name}: ${TYPE_LABELS[reviewing.type]}` : ''}
        onClose={() => setReviewing(null)}
      >
        <form className="form-grid single" onSubmit={submitReview}>
          <div className="form-group">
            <label htmlFor="review-status">Decision</label>
            <select
              id="review-status"
              value={reviewForm.status}
              onChange={(event) =>
                setReviewForm({ ...reviewForm, status: event.target.value })
              }
            >
              <option value="APPROVED">Approve</option>
              <option value="REJECTED">Reject</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="review-note">Note</label>
            <textarea
              id="review-note"
              rows="3"
              value={reviewForm.reviewNote}
              onChange={(event) =>
                setReviewForm({ ...reviewForm, reviewNote: event.target.value })
              }
              placeholder="Optional note for the employee"
            />
          </div>
          <div className="form-actions">
            <button type="button" className="ghost-button" onClick={() => setReviewing(null)}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={reviewMutation.isPending}>
              {reviewMutation.isPending ? 'Saving...' : 'Submit decision'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default Leave
