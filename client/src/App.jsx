import { useEffect, useState } from 'react'
import './App.css'
import DeviceAdmin from './DeviceAdmin'
import GeofenceAdmin from './GeofenceAdmin'

function App() {
  const [events, setEvents] = useState([])
  const [activeTab, setActiveTab] = useState('events')

  useEffect(() => {
    fetch('/api/events')
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error('Error fetching events:', error))
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case 'geofences':
        return <GeofenceAdmin />
      case 'devices':
        return <DeviceAdmin />
      case 'events':
      default:
        return (
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
        )
    }
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
      </header>

      <nav className="dashboard-tabs">
        <button
          className={activeTab === 'events' ? 'active' : ''}
          onClick={() => setActiveTab('events')}
        >
          Events
        </button>
        <button
          className={activeTab === 'geofences' ? 'active' : ''}
          onClick={() => setActiveTab('geofences')}
        >
          Geofences
        </button>
        <button
          className={activeTab === 'devices' ? 'active' : ''}
          onClick={() => setActiveTab('devices')}
        >
          Devices
        </button>
      </nav>

      <main className="dashboard-grid">
        {renderContent()}
      </main>
    </div>
  )
}

export default App
