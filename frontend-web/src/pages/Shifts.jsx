import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { shiftAPI, locationAPI } from '../api/shifts'
import { PERMISSIONS } from '../constants/permissions'
import { getUser } from '../utils/auth'
import { can } from '../utils/permissions'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import Notice from '../components/Notice'
import Loading from '../components/Loading'

const EMPTY_SHIFT = {
  name: '',
  startTime: '09:00',
  endTime: '18:00',
  graceMinutes: 10,
  breakMinutes: 60,
  isActive: true,
}

const EMPTY_LOCATION = {
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  radius: 100,
  isActive: true,
}

function Shifts() {
  const user = getUser()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('shifts')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [shiftForm, setShiftForm] = useState(EMPTY_SHIFT)
  const [locationForm, setLocationForm] = useState(EMPTY_LOCATION)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const shiftsQuery = useQuery({ queryKey: ['shifts'], queryFn: () => shiftAPI.list() })
  const locationsQuery = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationAPI.list(),
  })
  const shifts = shiftsQuery.data || []
  const locations = locationsQuery.data || []

  const saveShift = useMutation({
    mutationFn: (payload) =>
      editing ? shiftAPI.update(editing._id, payload) : shiftAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
      closeModal()
      setMessage(editing ? 'Shift updated.' : 'Shift created.')
    },
    onError: (err) => setError(err.response?.data?.message || 'Could not save shift.'),
  })

  const saveLocation = useMutation({
    mutationFn: (payload) =>
      editing ? locationAPI.update(editing._id, payload) : locationAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      closeModal()
      setMessage(editing ? 'Location updated.' : 'Location created.')
    },
    onError: (err) => setError(err.response?.data?.message || 'Could not save location.'),
  })

  const deleteShift = useMutation({
    mutationFn: shiftAPI.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
      setMessage('Shift deleted.')
    },
    onError: (err) => setError(err.response?.data?.message || 'Could not delete shift.'),
  })

  const deleteLocation = useMutation({
    mutationFn: locationAPI.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      setMessage('Location deleted.')
    },
    onError: (err) => setError(err.response?.data?.message || 'Could not delete location.'),
  })

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    setShiftForm(EMPTY_SHIFT)
    setLocationForm(EMPTY_LOCATION)
    setError('')
  }

  const openShift = (shift = null) => {
    setTab('shifts')
    setEditing(shift)
    setShiftForm(
      shift
        ? {
            name: shift.name,
            startTime: shift.startTime,
            endTime: shift.endTime,
            graceMinutes: shift.graceMinutes,
            breakMinutes: shift.breakMinutes,
            isActive: shift.isActive !== false,
          }
        : EMPTY_SHIFT
    )
    setError('')
    setMessage('')
    setModalOpen(true)
  }

  const openLocation = (location = null) => {
    setTab('locations')
    setEditing(location)
    setLocationForm(
      location
        ? {
            name: location.name,
            address: location.address || '',
            latitude: location.latitude ?? '',
            longitude: location.longitude ?? '',
            radius: location.radius ?? 100,
            isActive: location.isActive !== false,
          }
        : EMPTY_LOCATION
    )
    setError('')
    setMessage('')
    setModalOpen(true)
  }

  const submitShift = (event) => {
    event.preventDefault()
    saveShift.mutate({
      ...shiftForm,
      graceMinutes: Number(shiftForm.graceMinutes),
      breakMinutes: Number(shiftForm.breakMinutes),
    })
  }

  const submitLocation = (event) => {
    event.preventDefault()
    const payload = { ...locationForm, radius: Number(locationForm.radius) }
    if (payload.latitude === '') delete payload.latitude
    else payload.latitude = Number(payload.latitude)
    if (payload.longitude === '') delete payload.longitude
    else payload.longitude = Number(payload.longitude)
    saveLocation.mutate(payload)
  }

  const canCreate = can(user, 'shifts', PERMISSIONS.canCreate)
  const canUpdate = can(user, 'shifts', PERMISSIONS.canUpdate)
  const canDelete = can(user, 'shifts', PERMISSIONS.canDelete)

  return (
    <>
      <PageHeader
        eyebrow="WORKPLACE"
        title="Shifts & locations"
        subtitle="Configure working hours, grace periods and geo-fenced office locations."
        action={
          canCreate ? (
            <button
              className="primary-button"
              type="button"
              onClick={() => (tab === 'shifts' ? openShift() : openLocation())}
            >
              <span>＋</span> {tab === 'shifts' ? 'Add shift' : 'Add location'}
            </button>
          ) : null
        }
      />

      <Notice type="error">{error}</Notice>
      <Notice type="success">{message}</Notice>

      <div className="tabs">
        <button
          type="button"
          className={tab === 'shifts' ? 'tab active' : 'tab'}
          onClick={() => setTab('shifts')}
        >
          Shifts <span>{shifts.length}</span>
        </button>
        <button
          type="button"
          className={tab === 'locations' ? 'tab active' : 'tab'}
          onClick={() => setTab('locations')}
        >
          Locations <span>{locations.length}</span>
        </button>
      </div>

      {tab === 'shifts' ? (
        shiftsQuery.isLoading ? (
          <Loading text="Loading shifts..." />
        ) : (
          <section className="card-grid wide">
            {shifts.length === 0 ? (
              <section className="panel flat-panel empty-panel">
                <p>No shifts configured. Add a shift to assign working hours.</p>
              </section>
            ) : (
              shifts.map((shift) => (
                <article className="shift-card" key={shift._id}>
                  <div className="shift-time">
                    <span>{shift.startTime}</span>
                    <i />
                    <span>{shift.endTime}</span>
                  </div>
                  <h2>{shift.name}</h2>
                  <p>
                    {shift.graceMinutes} min grace · {shift.breakMinutes} min break
                  </p>
                  <div className="shift-foot">
                    <span
                      className={`status ${shift.isActive === false ? 'status-absent' : 'status-present'}`}
                    >
                      <i />
                      {shift.isActive === false ? 'Inactive' : 'Active'}
                    </span>
                    <div className="dept-actions">
                      {canUpdate && (
                        <button className="text-button" type="button" onClick={() => openShift(shift)}>
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="text-button danger"
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete ${shift.name}?`)) deleteShift.mutate(shift._id)
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        )
      ) : locationsQuery.isLoading ? (
        <Loading text="Loading locations..." />
      ) : (
        <section className="card-grid wide">
          {locations.length === 0 ? (
            <section className="panel flat-panel empty-panel">
              <p>No locations configured. Add an office location for geo-fenced check-ins.</p>
            </section>
          ) : (
            locations.map((location) => (
              <article className="shift-card" key={location._id}>
                <div className="location-pin">⌖</div>
                <h2>{location.name}</h2>
                <p>{location.address || 'No address provided'}</p>
                <div className="project-meta">
                  <span>
                    Radius <b>{location.radius} m</b>
                  </span>
                  <span>
                    Coords{' '}
                    <b>
                      {location.latitude != null && location.longitude != null
                        ? `${location.latitude}, ${location.longitude}`
                        : '—'}
                    </b>
                  </span>
                </div>
                <div className="shift-foot">
                  <span
                    className={`status ${location.isActive === false ? 'status-absent' : 'status-present'}`}
                  >
                    <i />
                    {location.isActive === false ? 'Inactive' : 'Active'}
                  </span>
                  <div className="dept-actions">
                    {canUpdate && (
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => openLocation(location)}
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="text-button danger"
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete ${location.name}?`)) {
                            deleteLocation.mutate(location._id)
                          }
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      )}

      <Modal
        open={modalOpen}
        title={
          editing
            ? tab === 'shifts'
              ? 'Edit shift'
              : 'Edit location'
            : tab === 'shifts'
              ? 'Add shift'
              : 'Add location'
        }
        subtitle={
          tab === 'shifts'
            ? 'Shifts define working hours and late-arrival thresholds.'
            : 'Locations power GPS and QR based check-ins.'
        }
        onClose={closeModal}
      >
        {tab === 'shifts' ? (
          <form className="form-grid" onSubmit={submitShift}>
            <div className="form-group full-span">
              <label htmlFor="shift-name">Shift name</label>
              <input
                id="shift-name"
                value={shiftForm.name}
                onChange={(event) => setShiftForm({ ...shiftForm, name: event.target.value })}
                placeholder="General shift"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="shift-start">Start time</label>
              <input
                id="shift-start"
                type="time"
                value={shiftForm.startTime}
                onChange={(event) =>
                  setShiftForm({ ...shiftForm, startTime: event.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="shift-end">End time</label>
              <input
                id="shift-end"
                type="time"
                value={shiftForm.endTime}
                onChange={(event) => setShiftForm({ ...shiftForm, endTime: event.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="shift-grace">Grace period (minutes)</label>
              <input
                id="shift-grace"
                type="number"
                min="0"
                max="240"
                value={shiftForm.graceMinutes}
                onChange={(event) =>
                  setShiftForm({ ...shiftForm, graceMinutes: event.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="shift-break">Break (minutes)</label>
              <input
                id="shift-break"
                type="number"
                min="0"
                max="240"
                value={shiftForm.breakMinutes}
                onChange={(event) =>
                  setShiftForm({ ...shiftForm, breakMinutes: event.target.value })
                }
              />
            </div>
            <label className="checkbox-field full-span">
              <input
                type="checkbox"
                checked={shiftForm.isActive}
                onChange={(event) =>
                  setShiftForm({ ...shiftForm, isActive: event.target.checked })
                }
              />
              Shift is active
            </label>
            <div className="form-actions full-span">
              <button type="button" className="ghost-button" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="primary-button" disabled={saveShift.isPending}>
                {saveShift.isPending ? 'Saving...' : editing ? 'Save changes' : 'Create shift'}
              </button>
            </div>
          </form>
        ) : (
          <form className="form-grid" onSubmit={submitLocation}>
            <div className="form-group">
              <label htmlFor="location-name">Location name</label>
              <input
                id="location-name"
                value={locationForm.name}
                onChange={(event) =>
                  setLocationForm({ ...locationForm, name: event.target.value })
                }
                placeholder="Head office"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="location-radius">Radius (metres)</label>
              <input
                id="location-radius"
                type="number"
                min="0"
                value={locationForm.radius}
                onChange={(event) =>
                  setLocationForm({ ...locationForm, radius: event.target.value })
                }
              />
            </div>
            <div className="form-group full-span">
              <label htmlFor="location-address">Address</label>
              <input
                id="location-address"
                value={locationForm.address}
                onChange={(event) =>
                  setLocationForm({ ...locationForm, address: event.target.value })
                }
                placeholder="12 MG Road, Bengaluru"
              />
            </div>
            <div className="form-group">
              <label htmlFor="location-lat">Latitude</label>
              <input
                id="location-lat"
                type="number"
                step="any"
                value={locationForm.latitude}
                onChange={(event) =>
                  setLocationForm({ ...locationForm, latitude: event.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="location-lng">Longitude</label>
              <input
                id="location-lng"
                type="number"
                step="any"
                value={locationForm.longitude}
                onChange={(event) =>
                  setLocationForm({ ...locationForm, longitude: event.target.value })
                }
              />
            </div>
            <label className="checkbox-field full-span">
              <input
                type="checkbox"
                checked={locationForm.isActive}
                onChange={(event) =>
                  setLocationForm({ ...locationForm, isActive: event.target.checked })
                }
              />
              Location is active
            </label>
            <div className="form-actions full-span">
              <button type="button" className="ghost-button" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="primary-button" disabled={saveLocation.isPending}>
                {saveLocation.isPending
                  ? 'Saving...'
                  : editing
                    ? 'Save changes'
                    : 'Create location'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}

export default Shifts
