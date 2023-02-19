import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import sqlite3 from 'sqlite3';

const server = express();
const PORT = 8080;
const db = new sqlite3.Database('database.db');

// create a table to store the form data
db.run('CREATE TABLE IF NOT EXISTS formData (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, message TEXT)');

server.use(bodyParser.json());
server.use(express.static(path.join('webapp', 'dist')));


server.listen(PORT, () => {
  console.log(`server at port ${PORT}`);
});

server.get('/XXX', async (request, response) => {
  response.sendStatus(404);
});


server.post('/submit-form', async (request, response) => {
  const { name, email, message } = request.body;

  try {
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO formData (name, email, message) VALUES (?, ?, ?)', [name, email, message], (error) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
    response.json({ message: 'Form submitted successfully' });
  } catch (error) {
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

server.get('/formData', async (request, response) => {
  const sql = 'SELECT * FROM formData';

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

server.get('/formData/:id', async (request, response) => {
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
