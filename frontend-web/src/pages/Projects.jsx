import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { projectAPI } from '../api/projects'
import { employeeAPI } from '../api/employees'
import { PERMISSIONS } from '../constants/permissions'
import { getUser } from '../utils/auth'
import { can } from '../utils/permissions'
import { getInitials } from '../utils/format'
import { formatDateShort, todayISO } from '../utils/forms'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import Notice from '../components/Notice'
import Loading from '../components/Loading'

const STATUSES = ['PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']

const STATUS_LABELS = {
  PLANNED: 'Planned',
  ACTIVE: 'In progress',
  ON_HOLD: 'On hold',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

const STATUS_CLASS = {
  PLANNED: 'status-leave',
  ACTIVE: 'status-present',
  ON_HOLD: 'status-late',
  COMPLETED: 'status-present',
  CANCELLED: 'status-absent',
}

const EMPTY_FORM = {
  name: '',
  code: '',
  client: '',
  manager: '',
  status: 'PLANNED',
  progress: 0,
  startDate: '',
  endDate: '',
  description: '',
  team: [],
}

function Projects() {
  const user = getUser()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: () => projectAPI.list() })
  const projects = projectsQuery.data || []

  const employeesQuery = useQuery({
    queryKey: ['employees', { search: undefined }],
    queryFn: () => employeeAPI.list(),
    enabled: can(user, 'employees', PERMISSIONS.canRead),
  })
  const employees = employeesQuery.data || []

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing ? projectAPI.update(editing._id, payload) : projectAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      setModalOpen(false)
      setEditing(null)
      setForm(EMPTY_FORM)
      setError('')
      setMessage(editing ? 'Project updated.' : 'Project created.')
    },
    onError: (err) => setError(err.response?.data?.message || 'Could not save project.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => projectAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      setMessage('Project deleted.')
    },
    onError: (err) => setError(err.response?.data?.message || 'Could not delete project.'),
  })

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, startDate: todayISO() })
    setError('')
    setMessage('')
    setModalOpen(true)
  }

  const openEdit = (project) => {
    setEditing(project)
    setForm({
      name: project.name || '',
      code: project.code || '',
      client: project.client || '',
      manager: project.manager || '',
      status: project.status || 'PLANNED',
      progress: project.progress ?? 0,
      startDate: project.startDate ? project.startDate.slice(0, 10) : '',
      endDate: project.endDate ? project.endDate.slice(0, 10) : '',
      description: project.description || '',
      team: (project.team || []).map((member) => member._id || member),
    })
    setError('')
    setMessage('')
    setModalOpen(true)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const toggleMember = (employeeId) => {
    setForm((current) => ({
      ...current,
      team: current.team.includes(employeeId)
        ? current.team.filter((id) => id !== employeeId)
        : [...current.team, employeeId],
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const payload = {
      ...form,
      progress: Number(form.progress) || 0,
    }
    Object.keys(payload).forEach((key) => {
      if (payload[key] === '') delete payload[key]
    })
    saveMutation.mutate(payload)
  }

  const handleDelete = (project) => {
    if (window.confirm(`Delete ${project.name}?`)) deleteMutation.mutate(project._id)
  }

  const canCreate = can(user, 'projects', PERMISSIONS.canCreate)
  const canUpdate = can(user, 'projects', PERMISSIONS.canUpdate)
  const canDelete = can(user, 'projects', PERMISSIONS.canDelete)

  return (
    <>
      <PageHeader
        eyebrow="WORK"
        title="Projects"
        subtitle="Track client work, delivery status and the people behind every project."
        action={
          canCreate ? (
            <button className="primary-button" type="button" onClick={openCreate}>
              <span>＋</span> New project
            </button>
          ) : null
        }
      />

      <Notice type="error">{error}</Notice>
      <Notice type="success">{message}</Notice>

      {projectsQuery.isLoading ? (
        <Loading text="Loading projects..." />
      ) : projectsQuery.isError ? (
        <div className="inline-error">
          {projectsQuery.error?.response?.data?.message || 'Unable to load projects.'}
        </div>
      ) : projects.length === 0 ? (
        <section className="panel flat-panel empty-panel">
          <p>No projects yet. Create a project to start assigning your team.</p>
        </section>
      ) : (
        <section className="card-grid wide">
          {projects.map((project) => (
            <article className="project-card" key={project._id}>
              <div className="project-top">
                <div>
                  <span className="project-code">{project.code || 'PROJECT'}</span>
                  <h2>{project.name}</h2>
                  <p>{project.client || 'Internal project'}</p>
                </div>
                <span className={`status ${STATUS_CLASS[project.status] || 'status-leave'}`}>
                  <i />
                  {STATUS_LABELS[project.status] || project.status}
                </span>
              </div>
              <div className="progress-label">
                <span>Progress</span>
                <strong>{project.progress || 0}%</strong>
              </div>
              <div className="progress large">
                <span style={{ width: `${project.progress || 0}%` }} />
              </div>
              <div className="project-meta">
                <span>Manager <b>{project.manager || '—'}</b></span>
                <span>Timeline <b>{formatDateShort(project.startDate)} – {formatDateShort(project.endDate)}</b></span>
              </div>
              <div className="project-team">
                <div className="avatar-stack">
                  {(project.team || []).slice(0, 5).map((member) => (
                    <div
                      key={member._id || member}
                      className={`avatar avatar-${member.color || 'blue'}`}
                      title={member.name || 'Team member'}
                    >
                      {member.initials || getInitials(member.name || '')}
                    </div>
                  ))}
                  {(project.team || []).length === 0 && <small>No team assigned</small>}
                  {(project.team || []).length > 5 && (
                    <span className="avatar more">+{(project.team || []).length - 5}</span>
                  )}
                </div>
                <div className="dept-actions">
                  {canUpdate && (
                    <button className="text-button" type="button" onClick={() => openEdit(project)}>
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className="text-button danger"
                      type="button"
                      onClick={() => handleDelete(project)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'Edit project' : 'New project'}
        subtitle="Assign a delivery lead, timeline and team members."
        onClose={() => setModalOpen(false)}
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="project-name">Project name</label>
            <input id="project-name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="project-code">Project code</label>
            <input id="project-code" name="code" value={form.code} onChange={handleChange} placeholder="PRJ-01" />
          </div>
          <div className="form-group">
            <label htmlFor="project-client">Client</label>
            <input id="project-client" name="client" value={form.client} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="project-manager">Manager</label>
            <input id="project-manager" name="manager" value={form.manager} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="project-status">Status</label>
            <select id="project-status" name="status" value={form.status} onChange={handleChange}>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="project-progress">Progress (%)</label>
            <input
              id="project-progress"
              name="progress"
              type="number"
              min="0"
              max="100"
              value={form.progress}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="project-start">Start date</label>
            <input id="project-start" name="startDate" type="date" value={form.startDate} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="project-end">End date</label>
            <input id="project-end" name="endDate" type="date" value={form.endDate} onChange={handleChange} />
          </div>
          <div className="form-group full-span">
            <label htmlFor="project-description">Description</label>
            <textarea
              id="project-description"
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          {employees.length > 0 && (
            <div className="form-group full-span">
              <label>Team members</label>
              <div className="checkbox-grid">
                {employees.map((employee) => (
                  <label className="checkbox-chip" key={employee._id}>
                    <input
                      type="checkbox"
                      checked={form.team.includes(employee._id)}
                      onChange={() => toggleMember(employee._id)}
                    />
                    {employee.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions full-span">
            <button type="button" className="ghost-button" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editing ? 'Save changes' : 'Create project'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default Projects
