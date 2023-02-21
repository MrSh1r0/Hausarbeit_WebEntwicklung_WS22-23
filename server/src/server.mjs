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
db.run('CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, dateTime TEXT)');

// Define the schema for the guests table
db.run('CREATE TABLE IF NOT EXISTS guests (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, isChild INTEGER, invitationStatus TEXT, eventID INTEGER, FOREIGN KEY(eventID) REFERENCES events(id))');

// Define the schema for the seating plans table
db.run('CREATE TABLE IF NOT EXISTS seating_plans (tablesNumber INTEGER, seatsPerTable INTEGER, isTwoSided INTEGER, eventID INTEGER, FOREIGN KEY(eventID) REFERENCES events(id))');

server.use(bodyParser.json());
server.use(express.static(path.join('webapp', 'dist')));


server.listen(PORT, () => {
  console.log(`server at port ${PORT}`);
});

server.get('/XXX', async (request, response) => {
  response.sendStatus(404);
});


server.post('/event', async (request, response) => {
  const { name, dateTime } = request.body;

  try {
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO formData (name, dateTime) VALUES (?, ?)', [name, dateTime], (error) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
    response.json({ message: 'Event created successfully' });
  } catch (error) {
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

server.get('/events', async (request, response) => {
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
        <td>${row.email}</td>
        <td>${row.message}</td>
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
                <th>Email</th>
                <th>Message</th>
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
});

server.get('/event/:id', async (request, response) => {
  const { id } = request.params;
  const sql = 'SELECT * FROM formData WHERE id = ?';

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
          <p>Email: ${row.email}</p>
          <p>Message: ${row.message}</p>
        </body>
      </html>
    `;
    response.send(html);
  } catch (error) {
    response.sendStatus(500);
  }
});

// close the database connection when the server is stopped
process.on('SIGINT', () => {
  db.close(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});
