import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { departmentAPI } from '../api/departments'
import { PERMISSIONS } from '../constants/permissions'
import { getUser } from '../utils/auth'
import { can } from '../utils/permissions'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import Notice from '../components/Notice'
import Loading from '../components/Loading'

const EMPTY_FORM = { name: '', manager: '' }

const ACCENTS = ['violet', 'green', 'orange', 'blue']

function Departments() {
  const user = getUser()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentAPI.list(),
  })
  const departments = departmentsQuery.data || []

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing ? departmentAPI.update(editing._id, payload) : departmentAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      setModalOpen(false)
      setEditing(null)
      setForm(EMPTY_FORM)
      setError('')
      setMessage(editing ? 'Department updated.' : 'Department created.')
    },
    onError: (err) => setError(err.response?.data?.message || 'Could not save department.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => departmentAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      setMessage('Department deleted.')
    },
    onError: (err) => setError(err.response?.data?.message || 'Could not delete department.'),
  })

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setMessage('')
    setModalOpen(true)
  }

  const openEdit = (department) => {
    setEditing(department)
    setForm({ name: department.name, manager: department.manager || '' })
    setError('')
    setMessage('')
    setModalOpen(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    saveMutation.mutate({ name: form.name, manager: form.manager })
  }

  const handleDelete = (department) => {
    if (window.confirm(`Delete ${department.name}? Employees will become unassigned.`)) {
      deleteMutation.mutate(department._id)
    }
  }

  const canCreate = can(user, 'departments', PERMISSIONS.canCreate)
  const canUpdate = can(user, 'departments', PERMISSIONS.canUpdate)
  const canDelete = can(user, 'departments', PERMISSIONS.canDelete)

  return (
    <>
      <PageHeader
        eyebrow="ORGANIZATION"
        title="Departments"
        subtitle="Group your team into functional units and assign department leads."
        action={
          canCreate ? (
            <button className="primary-button" type="button" onClick={openCreate}>
              <span>＋</span> Add department
            </button>
          ) : null
        }
      />

      <Notice type="error">{error}</Notice>
      <Notice type="success">{message}</Notice>

      {departmentsQuery.isLoading ? (
        <Loading text="Loading departments..." />
      ) : departmentsQuery.isError ? (
        <div className="inline-error">
          {departmentsQuery.error?.response?.data?.message || 'Unable to load departments.'}
        </div>
      ) : departments.length === 0 ? (
        <section className="panel flat-panel empty-panel">
          <p>No departments yet. Create your first department to organise the team.</p>
        </section>
      ) : (
        <section className="card-grid">
          {departments.map((department, index) => (
            <article className="dept-card" key={department._id}>
              <div className={`dept-mark ${ACCENTS[index % ACCENTS.length]}`}>
                {department.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="dept-info">
                <h2>{department.name}</h2>
                <p>{department.manager ? `Lead · ${department.manager}` : 'No department lead'}</p>
              </div>
              <div className="dept-count">
                <strong>{department.count || 0}</strong>
                <small>employees</small>
              </div>
              {(canUpdate || canDelete) && (
                <div className="dept-actions">
                  {canUpdate && (
                    <button className="text-button" type="button" onClick={() => openEdit(department)}>
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className="text-button danger"
                      type="button"
                      onClick={() => handleDelete(department)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </article>
          ))}
        </section>
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'Edit department' : 'Add department'}
        subtitle="Departments help you filter attendance, reports and payroll."
        onClose={() => setModalOpen(false)}
      >
        <form className="form-grid single" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="department-name">Department name</label>
            <input
              id="department-name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Engineering"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="department-manager">Department lead</label>
            <input
              id="department-manager"
              value={form.manager}
              onChange={(event) => setForm({ ...form, manager: event.target.value })}
              placeholder="Rahul Sharma"
            />
          </div>
          <div className="form-actions">
            <button type="button" className="ghost-button" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editing ? 'Save changes' : 'Create department'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default Departments
