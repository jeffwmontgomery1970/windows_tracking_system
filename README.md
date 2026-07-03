# Windows Tracking System

This repository contains a React client and an Express server for tracking geofence events and devices.

## Server

The `server.js` file in the repository root runs an Express server with the following API endpoints:

- `GET /api/events` - List all events
- `POST /api/events` - Create a new event
- `PUT /api/events/:id` - Update an event status
- `DELETE /api/events/:id` - Remove an event
- `GET /api/geofences` - List all geofences
- `POST /api/geofences` - Create a new geofence
- `PUT /api/geofences/:id` - Update a geofence
- `DELETE /api/geofences/:id` - Remove a geofence
- `GET /api/devices` - List all devices
- `POST /api/devices` - Create a new device

The server uses `better-sqlite3` and stores data in `tracking.db`.

## Client

The client application is located in the `client/` folder and is built with Vite and React.

To run the client locally:

```bash
cd client
npm install
npm run dev
```

The client fetches data from the server API endpoints and displays:

- Events in the main dashboard table
- Geofences in the right-hand top table
- Devices in the right-hand bottom table

## Notes

- The GitHub repository remote is already configured as `origin`.
- `tracking.db` is ignored by Git via the root `.gitignore`.
