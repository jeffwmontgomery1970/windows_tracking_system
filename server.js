const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const db = new Database('tracking.db', { verbose: console.log });

const createSchema = () => {
  const schema = `PRAGMA foreign_keys = ON;
  
		CREATE TABLE IF NOT EXISTS events (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		geofence_id INTEGER NOT NULL,
		device_id INTEGER NOT NULL,
		status TEXT NOT NULL,
		timestamp INTEGER NOT NULL,
		FOREIGN KEY (geofence_id) REFERENCES geofences(id)
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
		FOREIGN KEY (device_id) REFERENCES devices(id)
        ON DELETE CASCADE 
        ON UPDATE CASCADE);

		CREATE TABLE IF NOT EXISTS geofences (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		minlat FLOAT,
		maxlat FLOAT,
		minlong FLOAT,
		maxlong FLOAT
		);

		CREATE TABLE IF NOT EXISTS states (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		geofence_id INTEGER NOT NULL,
		device_id INTEGER NOT NULL,
		state INTEGER,
		FOREIGN KEY (geofence_id) REFERENCES geofences(id)
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
		FOREIGN KEY (device_id) REFERENCES devices(id)
        ON DELETE CASCADE 
        ON UPDATE CASCADE);

		CREATE TABLE IF NOT EXISTS devices (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		description TEXT NOT NULL
		);`;

  // .exec() can run multiple SQL statements separated by semicolons
  db.exec(schema);
};

// Initialize tables immediately
createSchema();


// API Routes
// GET all events
app.get('/api/events', (req, res) => {
  const stmt = db.prepare('SELECT * FROM events');
  const items = stmt.all();
  res.json(items);
});

// POST a new event
app.post('/api/events', (req, res) => {
  const { geofence_id, device_id, status, timestamp } = req.body;
  let local_timestamp = 0;
  if (!timestamp) {
	local_timestamp = Math.floor(Date.now() / 1000);
  } else {
	local_timestamp = timestamp;
  }
  const stmt = db.prepare('INSERT INTO events (geofence_id, device_id, status, timestamp) VALUES (?,?,?,?)');
  const info = stmt.run(geofence_id, device_id, status, local_timestamp);
  res.json({ id: info.lastInsertRowid, geofence_id, device_id, status, timestamp: local_timestamp });
});

// Change the status of an event
app.put('/api/events/:id', (req, res) => {
	const { id } = req.params;
	const { status } = req.body;
	const stmt = db.prepare('UPDATE events SET status = ? WHERE id = ?');
	const info = stmt.run(id, status);
	if (info.changes == 0) {
		res.status(404).json({error: "Event id not found."});
	} else {
		res.json({message: "Event status changed successfully."});
	}
});

// Delete an event
app.delete('/api/events/:id', (req, res) => {
	const { id } = req.params;
	const stmt = db.prepare('DELETE FROM events WHERE id = ?');
	const info = stmt.run(id);
	if (info.changes == 0) {
		res.status(404).json({error: "Event id not found."});
	} else {
		res.json({message: "Event deleted successfully"});
	}
})

// GET all geofences
app.get('/api/geofences', (req, res) => {
  const stmt = db.prepare('SELECT * FROM geofences');
  const items = stmt.all();
  res.json(items);
});

// POST a new geofence
app.post('/api/geofences', (req, res) => {
  const { minlat, maxlat, minlong, maxlong } = req.body;
  const stmt = db.prepare('INSERT INTO geofences (minlat, maxlat, minlong, maxlong) VALUES (?,?,?,?)');
  const info = stmt.run(minlat, maxlat, minlong, maxlong);
  res.json({ id: info.lastInsertRowid, minlat, maxlat, minlong, maxlong });
});

// Change the co-ords of a fence
app.put('/api/geofences/:id', (req, res) => {
	const { id } = req.params;
	const { minlat, maxlat, minlong, maxlong } = req.body;
	let stmt_str = `UPDATE geofences SET`;
	let params = []

	if (minlat !== undefined) {
		stmt_str += ` minlat = ?`;
		params.push(minlat);
	}
	if (maxlat !== undefined) {
		if (params.length > 0) {
			stmt_str += `,`;
		}
		stmt_str += ` maxlat = ?`;
	    params.push(maxlat);
	}	
	if (minlong !== undefined) {
		if (params.length > 0) {
			stmt_str += `,`;
		}
		stmt_str += ` minlong = ?`;
		params.push(minlong);
	}
	if (maxlong !== undefined) {
		if (params.length > 0) {
			stmt_str += `,`;
		}
		stmt_str += ` maxlong = ?`;
		params.push(maxlong);
	}

	if (params.length > 0) {
		stmt_str += ` WHERE id = ?`;
		params.push(id);

		const stmt = db.prepare(stmt_str);
		const info = stmt.run(params);
		if (info.changes == 0) {
			res.status(404).json({error: "Geofence id not found"});
		} else {
			res.json({message: "Geofence co-ordinats updated successfully."});
		}
	} else {
	    res.status(500).json({error: "Nothing found to update."})
	}
});

// Delete a geofence
app.delete('/api/geofences/:id', (req, res) => {
	const { id } = req.params;
	const stmt = db.prepare('DELETE FROM geofences WHERE id = ?');
	const info = stmt.run(id);
	if (info.changes == 0) {
		res.status(404).json({error: "Geofence id not found."});
	} else {
		res.json({message: "Geofence deleted successfully"});
	}
})

// GET all devices
app.get('/api/devices', (req, res) => {
  const stmt = db.prepare('SELECT * FROM devices');
  const items = stmt.all();
  res.json(items);
});

// POST a new device
app.post('/api/devices', (req, res) => {
  const { description } = req.body;
  const stmt = db.prepare('INSERT INTO devices (description) VALUES (?)');
  const info = stmt.run(description);
  res.json({ id: info.lastInsertRowid, description });
});

// Change the description of a device
app.put('/api/devices/:id', (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ error: 'Description is required.' });
  }

  const stmt = db.prepare('UPDATE devices SET description = ? WHERE id = ?');
  const info = stmt.run(description, id);
  if (info.changes === 0) {
    res.status(404).json({ error: 'Device id not found.' });
  } else {
    res.json({ message: 'Device updated successfully.' });
  }
});

// Delete a device
app.delete('/api/devices/:id', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('DELETE FROM devices WHERE id = ?');
  const info = stmt.run(id);
  if (info.changes === 0) {
    res.status(404).json({ error: 'Device id not found.' });
  } else {
    res.json({ message: 'Device deleted successfully.' });
  }
});

// Change the description of a device
app.put('/api/devices/:id', (req, res) => {
	const { id } = req.params;
	const { description } = req.body;
    const stmt = db.prepare('UPDATE devices SET description = ? WHERE id = ?');
	const info = stmt.run(description, id);
	if (info.changes == 0) {
		res.status(404).json({error: "Device id not found"});
	} else {
		res.json({message: "Device description updated successfully."});
	}
});

// Delete a device
app.delete('/api/devices/:id', (req, res) => {
	const { id } = req.params;
	const stmt = db.prepare('DELETE FROM devices WHERE id = ?');
	const info = stmt.run(id);
	if (info.changes == 0) {
		res.status(404).json({error: "Device id not found."});
	} else {
		res.json({message: "Device deleted successfully"});
	}
})

// GET all states
app.get('/api/states', (req, res) => {
  const stmt = db.prepare('SELECT * FROM states');
  const items = stmt.all();
  res.json(items);
});

// POST a new or updated state
app.post('/api/states', (req, res) => {
  const { geofence_id, device_id, state } = req.body;
  const get_existing = db.prepare('SELECT * FROM states WHERE geofence_id = ? AND device_id = ?');
  const existing = get_existing.all(geofence_id, device_id);

  if (existing.length > 0) {
	const update_existing = db.prepare('UPDATE states SET state = ? WHERE geofence_id = ? AND device_ID = ?');
	const update_info = update_existing.run(state ? 1 : 0, geofence_id, device_id);
	if (update_info.changes == 0) {
		res.status(500).json({error: "Failed to update existing state"});
	} else {
		res.json({message: "Update existing state for geofence and device"});
	}
    } else {
	    const insert_new = db.prepare("INSERT INTO states (geofence_id, device_id, state) VALUES (?,?,?)");
	    const insert_info = insert_new.run(geofence_id, device_id, state ? 1 : 0);
	    if (insert_info.changes == 0) {
		    res.status(500).json({error: "Failed to insert new state for Geofence and Device"});
	    } else {
		    res.json({ id: insert_info.lastInsertRowid, geofence_id, device_id, state});
	    }
    }
  });

// Change a state for Geofence Device pair
app.put('/api/states/:id', (req, res) => {
	const { id } = req.params;
	const { state } = req.body;
    const stmt = db.prepare('UPDATE states SET state = ? WHERE id = ?');
	const info = stmt.run(state ? 1 : 0, id);
	if (info.changes == 0) {
		res.status(404).json({error: "State id not found"});
	} else {
		res.json({message: "State updated successfully."});
	}
});

// Delete a state
app.delete('/api/states/:id', (req, res) => {
	const { id } = req.params;
	const stmt = db.prepare('DELETE FROM states WHERE id = ?');
	const info = stmt.run(id);
	if (info.changes == 0) {
		res.status(404).json({error: "State id not found."});
	} else {
		res.json({message: "State deleted successfully"});
	}
})

// Submit tracking data
app.post('/api/tracking', (req,res) => {
	const {device_id, lat, long, timestamp} = req.body;
	if (lat && long) {
		// check for device id
		const get_device = db.prepare('SELECT * FROM devices WHERE id = ?');
		const device = get_device.all(device_id);
		if (device.length > 0) {
			res.json({message: "Processing device against geofences."});
			const get_fences = db.prepare('SELECT * FROM geofences');
			const fences = get_fences.all();
			if (fences.length > 0) {
				fences.forEach((fence) => {
					const inFence = (lat > fence.minlat && lat < fence.maxlat && long > fence.minlong && long < fence.maxlong);
					const get_existing_state = db.prepare('SELECT * FROM states WHERE geofence_id = ? and device_id = ?');
					const existing_state = get_existing_state.all(fence.id,device_id);
					if (existing_state.length > 0) {
						if (Boolean(existing_state[0].state) != inFence) {
							const add_event_stmt = db.prepare('INSERT INTO events (geofence_id, device_id, status, timestamp) VALUES (?,?,?,?)');
							const add_event_info = add_event_stmt.run(fence.id,device_id,inFence ? "entering" : "exiting",timestamp ? timestamp : Math.floor(Date.now() / 1000));
							const update_state_stmt = db.prepare('UPDATE states SET state = ? WHERE geofence_id = ? AND device_id = ?');
							const update_state = update_state_stmt.run(fence.id,device_id,inFence ? 1 : 0);
						}
					} else {
						const add_state_stmt = db.prepare('INSERT INTO states (geofence_id, device_id, state) VALUES (?,?,?)');
						const add_state = add_state_stmt.run(fence.id, device_id, inFence ? 1 : 0);
					}
				});
			}
		} else {
			res.status(404).json({error: "Device id was not found"});
		}
	}
});
							                              

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
