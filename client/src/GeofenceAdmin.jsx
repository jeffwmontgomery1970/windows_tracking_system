import { useEffect, useState } from 'react'

const emptyForm = {
  minlat: '',
  maxlat: '',
  minlong: '',
  maxlong: '',
}

function GeofenceAdmin() {
  const [geofences, setGeofences] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetchGeofences()
  }, [])

  const fetchGeofences = () => {
    fetch('/api/geofences')
      .then((response) => response.json())
      .then((data) => setGeofences(data))
      .catch((error) => console.error('Error fetching geofences:', error))
  }

  const selectGeofence = (geofence) => {
    setSelectedId(geofence.id)
    setForm({
      minlat: geofence.minlat ?? '',
      maxlat: geofence.maxlat ?? '',
      minlong: geofence.minlong ?? '',
      maxlong: geofence.maxlong ?? '',
    })
    setStatus(`Selected geofence ${geofence.id}`)
  }

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const clearForm = () => {
    setSelectedId(null)
    setForm(emptyForm)
    setStatus('')
  }

  const saveGeofence = async () => {
    if (!selectedId) {
      setStatus('Select a geofence to save.')
      return
    }

    const body = {
      minlat: form.minlat === '' ? null : parseFloat(form.minlat),
      maxlat: form.maxlat === '' ? null : parseFloat(form.maxlat),
      minlong: form.minlong === '' ? null : parseFloat(form.minlong),
      maxlong: form.maxlong === '' ? null : parseFloat(form.maxlong),
    }

    const response = await fetch(`/api/geofences/${selectedId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      await fetchGeofences()
      setStatus(`Geofence ${selectedId} saved.`)
    } else {
      const error = await response.json()
      setStatus(error.error || 'Unable to save geofence.')
    }
  }

  const addGeofence = async () => {
    const body = {
      minlat: form.minlat === '' ? null : parseFloat(form.minlat),
      maxlat: form.maxlat === '' ? null : parseFloat(form.maxlat),
      minlong: form.minlong === '' ? null : parseFloat(form.minlong),
      maxlong: form.maxlong === '' ? null : parseFloat(form.maxlong),
    }

    const response = await fetch('/api/geofences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      await fetchGeofences()
      clearForm()
      setStatus('Geofence added.')
    } else {
      const error = await response.json()
      setStatus(error.error || 'Unable to add geofence.')
    }
  }

  const deleteGeofence = async () => {
    if (!selectedId) {
      setStatus('Select a geofence to delete.')
      return
    }

    const response = await fetch(`/api/geofences/${selectedId}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      await fetchGeofences()
      clearForm()
      setStatus(`Geofence ${selectedId} deleted.`)
    } else {
      const error = await response.json()
      setStatus(error.error || 'Unable to delete geofence.')
    }
  }

  return (
    <div className="management-page">
      <section className="management-table panel">
        <h2>Geofence list</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Min Lat</th>
                <th>Max Lat</th>
                <th>Min Long</th>
                <th>Max Long</th>
              </tr>
            </thead>
            <tbody>
              {geofences.length === 0 ? (
                <tr>
                  <td colSpan="5">No geofences available.</td>
                </tr>
              ) : (
                geofences.map((geofence) => (
                  <tr
                    key={geofence.id}
                    className={selectedId === geofence.id ? 'selected-row' : ''}
                    onClick={() => selectGeofence(geofence)}
                  >
                    <td>{geofence.id}</td>
                    <td>{geofence.minlat}</td>
                    <td>{geofence.maxlat}</td>
                    <td>{geofence.minlong}</td>
                    <td>{geofence.maxlong}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="management-form panel">
        <h2>{selectedId ? `Edit geofence ${selectedId}` : 'Add new geofence'}</h2>
        <div className="form-grid">
          <label>
            Min Lat
            <input
              value={form.minlat}
              onChange={(event) => updateField('minlat', event.target.value)}
              type="number"
              step="any"
            />
          </label>
          <label>
            Max Lat
            <input
              value={form.maxlat}
              onChange={(event) => updateField('maxlat', event.target.value)}
              type="number"
              step="any"
            />
          </label>
          <label>
            Min Long
            <input
              value={form.minlong}
              onChange={(event) => updateField('minlong', event.target.value)}
              type="number"
              step="any"
            />
          </label>
          <label>
            Max Long
            <input
              value={form.maxlong}
              onChange={(event) => updateField('maxlong', event.target.value)}
              type="number"
              step="any"
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="button" onClick={saveGeofence} disabled={!selectedId}>
            Save
          </button>
          <button type="button" onClick={addGeofence}>
            Add
          </button>
          <button type="button" onClick={deleteGeofence} disabled={!selectedId}>
            Delete
          </button>
          <button type="button" onClick={clearForm} className="secondary">
            Clear
          </button>
        </div>
        {status && <p className="form-status">{status}</p>}
      </section>
    </div>
  )
}

export default GeofenceAdmin
