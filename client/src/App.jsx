import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [events, setEvents] = useState([])
  const [geofences, setGeofences] = useState([])
  const [devices, setDevices] = useState([])

  useEffect(() => {
    fetch('/api/events')
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error('Error fetching events:', error))

    fetch('/api/geofences')
      .then((response) => response.json())
      .then((data) => setGeofences(data))
      .catch((error) => console.error('Error fetching geofences:', error))

    fetch('/api/devices')
      .then((response) => response.json())
      .then((data) => setDevices(data))
      .catch((error) => console.error('Error fetching devices:', error))
  }, [])

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
      </header>

      <main className="dashboard-grid">
        <section className="panel events-panel">
          <h2>Events</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Geofence</th>
                  <th>Device</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan="5">No events available.</td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id}>
                      <td>{event.id}</td>
                      <td>{event.geofence_id}</td>
                      <td>{event.device_id}</td>
                      <td>{event.status}</td>
                      <td>{new Date(event.timestamp * 1000).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="side-panel">
          <section className="panel">
            <h2>Geofences</h2>
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
                      <tr key={geofence.id}>
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

          <section className="panel">
            <h2>Devices</h2>
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
                      <tr key={device.id}>
                        <td>{device.id}</td>
                        <td>{device.description}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
