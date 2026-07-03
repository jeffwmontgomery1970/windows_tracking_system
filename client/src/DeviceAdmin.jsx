import { useEffect, useState } from 'react'

const emptyForm = {
  description: '',
}

function DeviceAdmin() {
  const [devices, setDevices] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = () => {
    fetch('/api/devices')
      .then((response) => response.json())
      .then((data) => setDevices(data))
      .catch((error) => console.error('Error fetching devices:', error))
  }

  const selectDevice = (device) => {
    setSelectedId(device.id)
    setForm({ description: device.description ?? '' })
    setStatus(`Selected device ${device.id}`)
  }

  const updateField = (value) => {
    setForm({ description: value })
  }

  const clearForm = () => {
    setSelectedId(null)
    setForm(emptyForm)
    setStatus('')
  }

  const saveDevice = async () => {
    if (!selectedId) {
      setStatus('Select a device to save.')
      return
    }

    const body = {
      description: form.description,
    }

    const response = await fetch(`/api/devices/${selectedId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      await fetchDevices()
      setStatus(`Device ${selectedId} saved.`)
    } else {
      const error = await response.json()
      setStatus(error.error || 'Unable to save device.')
    }
  }

  const addDevice = async () => {
    const response = await fetch('/api/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: form.description }),
    })

    if (response.ok) {
      await fetchDevices()
      clearForm()
      setStatus('Device added.')
    } else {
      const error = await response.json()
      setStatus(error.error || 'Unable to add device.')
    }
  }

  const deleteDevice = async () => {
    if (!selectedId) {
      setStatus('Select a device to delete.')
      return
    }

    const response = await fetch(`/api/devices/${selectedId}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      await fetchDevices()
      clearForm()
      setStatus(`Device ${selectedId} deleted.`)
    } else {
      const error = await response.json()
      setStatus(error.error || 'Unable to delete device.')
    }
  }

  return (
    <div className="management-page">
      <section className="management-table panel">
        <h2>Device list</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {devices.length === 0 ? (
                <tr>
                  <td colSpan="2">No devices available.</td>
                </tr>
              ) : (
                devices.map((device) => (
                  <tr
                    key={device.id}
                    className={selectedId === device.id ? 'selected-row' : ''}
                    onClick={() => selectDevice(device)}
                  >
                    <td>{device.id}</td>
                    <td>{device.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="management-form panel">
        <h2>{selectedId ? `Edit device ${selectedId}` : 'Add new device'}</h2>
        <div className="form-grid">
          <label>
            Description
            <input
              value={form.description}
              onChange={(event) => updateField(event.target.value)}
              type="text"
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="button" onClick={saveDevice} disabled={!selectedId}>
            Save
          </button>
          <button type="button" onClick={addDevice}>
            Add
          </button>
          <button type="button" onClick={deleteDevice} disabled={!selectedId}>
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

export default DeviceAdmin
