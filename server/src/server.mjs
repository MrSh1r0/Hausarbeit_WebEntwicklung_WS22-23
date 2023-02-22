import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import sqlite3 from 'sqlite3';

const server = express();
const PORT = 8080;
const db = new sqlite3.Database('database.db', (error) => {
  if (error) {
    console.error(error.message);
  }
  console.log('Connected to the events database.');
});

// Define the schema for the events table
db.run('CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY, name TEXT, dateTime TEXT)');

// Define the schema for the guests table
db.run('CREATE TABLE IF NOT EXISTS guests (id INTEGER PRIMARY KEY, guestName TEXT, isChild INTEGER, invitationStatus TEXT, eventID INTEGER, FOREIGN KEY(eventID) REFERENCES events(id))');

// Define the schema for the seat table
db.run('CREATE TABLE IF NOT EXISTS seat (tablesNumber INTEGER, seatsPerTable INTEGER, isTwoSided INTEGER, eventID INTEGER, FOREIGN KEY(eventID) REFERENCES events(id))');

server.use(bodyParser.json());

server.listen(PORT, () => {
  console.log(`server at port ${PORT}`);
});

server.use(express.static(path.join('webapp', 'dist')));

// close the database connection when the server is stopped
process.on('SIGINT', () => {
  db.close(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});

server.get('/XXX', async (request, response) => {
  response.sendStatus(404);
});


server.post('/event', async (request, response) => {
  const name = request.body.eventName;
  const dateTime = request.body.eventDateTime;
  try {
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO events (name, dateTime) VALUES ( ?, ?)', [ name, dateTime], (error) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
    response.status(201).json({ message: 'Event created successfully' });
  } catch (error) {
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

/* server.get('/events', async (request, response) => {
  const sql = 'SELECT * FROM events';

  try {
    const rows = await new Promise((resolve, reject) => {
      db.all(sql, [], (error, rows) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve(rows);
        }
      });
    });
    const tableRows = rows.map(row => `
      <tr>
        <td>${row.id}</td>
        <td>${row.name}</td>
        <td>${row.dateTime}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <title>Submissions</title>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Date Time</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;
    response.send(html);
  } catch (error) {
    response.sendStatus(500);
  }
}); */

//handle events
const event_ID_URL='/event/:id'; 

server.get(event_ID_URL, async (request, response) => {
  const { id } = request.params;
  const sql = 'SELECT * FROM events WHERE id = ?';

  try {
    const row = await new Promise((resolve, reject) => {
      db.get(sql, [id], (error, row) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve(row);
        }
      });
    });

    if (!row) {
      response.status(404).json({ error: 'Form submission not found' });
      return;
    }

    const html = `
      <html>
        <head>
          <title>Submission ${id}</title>
        </head>
        <body>
          <h1>Submission ${id}</h1>
          <p>Name: ${row.name}</p>
          <p>Email: ${row.dateTime}</p>
          <form method="delete">
            <button>Delete</button>
          </form>
        </body>
      </html>
    `;
    response.send(html);
  } catch (error) {
    response.sendStatus(500);
  }
});

server.put(event_ID_URL, async (request, response) => {
  const id = request.params.id;
  const name = request.body.EventName;
  const dateTime = request.body.eventDateTime;
  try {
    await new Promise((resolve, reject) => {
      db.run('UPDATE events SET name = ?, dateTime = ? WHERE id = ? ', [name, dateTime, id], (error) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
    response.sendStatus(204);
  } catch (error) {
    response.status(500).send(error.message);
  }
});

server.delete(event_ID_URL, async (request, response) => {
  const id = request.params.id;
  try {
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM events WHERE id = ?', [id], (error) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
    response.sendStatus(204);
  } catch (error) {
    response.status(500).send(error.message);
  }
});

//handle guests
server.post('/event/:id/guests', async (request, response) => {
  const id = request.params.id;
  const name = request.body.name;
  const isChild = request.body.isChild;
  const invitationStatus = request.body.invitationStatus;
  try {
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO guests (name, isChild, invitationStatus, eventID) VALUES (?, ?, ?, ?)', [name, isChild, invitationStatus, id], (error) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
    response.sendStatus(201);
  } catch (error) {
    response.status(500).send(error.message);
  }
});
const guest_ID_URL='/event/:id/guest/:guest_id';

server.put(guest_ID_URL, async (request, response) => {
  const id = request.params.id;
  const name = request.body.name;
  const isChild = request.body.isChild;
  const invitationStatus = request.body.invitationStatus;
  const guest_id = request.params.guest_id;
  try {
    await new Promise((resolve, reject) => {
      db.run('UPDATE guests SET name = ?, isChild = ? eventID = ? WHERE id = ? AND eventID = ?', [name, isChild, invitationStatus, guest_id, id], (error) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
    response.sendStatus(204);
  } catch (error) {
    response.status(500).send(error.message);
  }
});

server.delete(guest_ID_URL, async (request, response) => {
  const id = request.params.id;
  const guest_id = request.params.guest_id;
  try {
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM guests WHERE id = ? AND eventID = ?', [guest_id, id], (error) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
    response.sendStatus(204);
  } catch (error) {
    response.status(500).send(error.message);
  }
});

//handle seats
const seats_URL='/event/:id/seat';
server.post(seats_URL, async (request, response) => {
  const id = request.params.id;
  const tablesNumber = request.body.tablesNumber;
  const seatsPerTable = request.body.seatsPerTable;
  const isTwoSided = request.body.isTwoSided;
  try {
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO seat (tablesNumber, seatsPerTable, isTwoSided, eventID) VALUES (?, ?, ?, ?)', [tablesNumber, seatsPerTable, isTwoSided, id], (error) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
    response.sendStatus(201);
  } catch (error) {
    response.status(500).send(error.message);
  }
});


server.put(seats_URL, async (request, response) => {
  const id = request.params.id;
  const tablesNumber = request.body.tablesNumber;
  const seatsPerTable = request.body.seatsPerTable;
  const isTwoSided = request.body.isTwoSided;
  try {
    await new Promise((resolve, reject) => {
      db.run('UPDATE seat SET tablesNumber = ?, seatsPerTable = ? isTwoSided = ? WHERE eventID = ?', [tablesNumber, seatsPerTable, isTwoSided, id], (error) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
    response.sendStatus(204);
  } catch (error) {
    response.status(500).send(error.message);
  }
});

server.delete(seats_URL, async (request, response) => {
  const id = request.params.id;
  try {
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM seat WHERE eventID = ?', [id], (error) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
    response.sendStatus(204);
  } catch (error) {
    response.status(500).send(error.message);
  }
});