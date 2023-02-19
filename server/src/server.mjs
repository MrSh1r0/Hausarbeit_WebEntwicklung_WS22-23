import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import sqlite3 from 'sqlite3';

const server = express();
const PORT = 8080;

// Connect to the SQLite database
const db = new sqlite3.Database('database.db', (error) => {
  if (error) {
    console.error(error.message);
  }
  console.log('Connected to the events database.');
});

// Define the schema for the events table
db.run('CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, dateTime TEXT)');

// Define the schema for the guests table
db.run('CREATE TABLE IF NOT EXISTS guests (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, isChild INTEGER, invitationStatus TEXT, eventID INTEGER, FOREIGN KEY(eventID) REFERENCES events(id))');

// Define the schema for the seating plans table
db.run('CREATE TABLE IF NOT EXISTS seating_plans (id INTEGER PRIMARY KEY AUTOINCREMENT, tablesNumber INTEGER, seatsPerTable INTEGER, isTwoSided INTEGER, eventID INTEGER, FOREIGN KEY(eventID) REFERENCES events(id))');

server.use(bodyParser.json());
server.use(express.static(path.join('webapp', 'dist')));

server.listen(PORT, () => {
  console.log(`server at port ${PORT}`);
});

server.get('/XXX', async (request, response) => {
  response.sendStatus(404);
});

// Define routes for creating and deleting events
server.post('/events', async (request, response) => {
  const name = request.body.name;
  const dateTime = request.body.dateTime;
  try {
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO events (name, dateTime) VALUES (?, ?)', [name, dateTime], (error) => {
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

server.delete('/events/:id', async (request, response) => {
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

// Define routes for managing guests for an event
server.get('/events/:id/guests', async (request, response) => {
  const id = request.params.id;
  try {
    const rows = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM guests WHERE eventID = ?', [id], (error, rows) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve(rows);
        }
      });
    });
    response.json(rows);
  } catch (error) {
    response.status(500).send(error.message);
  }
});

server.post('/events/:id/guests', async (request, response) => {
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

server.delete('/events/:id/guests/:guest_id', async (request, response) => {
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

// Define routes for managing seating plans for an event
server.get('/events/:id/guests/:guest_id', async (request, response) => {
  const id = request.params.id;
  const guest_id = request.params.guest_id;

  try {
    const rows = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM seating_plans WHERE eventID = ?', [guest_id, id], (error, rows) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve(rows);
        }
      });
    });
    response.json(rows);
  } catch (error) {
    response.status(500).send(error.message);
  }
});

server.post('/events/:id/seating-plans', async (request, response) => {
  const id = request.params.id;
  const tablesNumber = request.body.tablesNumber;
  const seatsPerTable = request.body.seatsPerTable;
  const isTwoSided = request.body.isTwoSided;
  try {
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO seating_plans (tablesNumber, seatsPerTable, isTwoSided, eventID) VALUES (?, ?, ?, ?)', [tablesNumber, seatsPerTable, isTwoSided, id], (error) => {
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

server.delete('/events/:id/seating-plans/:plan_id', async (request, response) => {
  const id = request.params.id;
  const plan_id = request.params.plan_id;
  try {
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM seating_plans WHERE id = ? AND eventID = ?', [plan_id, id], (error) => {
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

// close the database connection when the server is stopped
process.on('SIGINT', () => {
  db.close(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});
