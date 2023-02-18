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

server.get('/XXX', (request, response) => {
  response.sendStatus(404);
});

server.post('/submit-form', (request, response) => {
  const { name, email, message } = request.body;

  // insert the form data into the database
  db.run('INSERT INTO formData (name, email, message) VALUES (?, ?, ?)', [name, email, message], (error) => {
    if (error) {
      console.error(error);
      response.status(500).json({ error: 'Internal Server Error' });
    } else {
      response.json({ message: 'Form submitted successfully' });
    }
  });
});

server.get('/formData', (request, response) => {
  const sql = 'SELECT * FROM formData';

  db.all(sql, [], (error, rows) => {
    if (error) {
      console.error(error);
      response.sendStatus(500);
    } else {
      const tableRows = rows.map(row => `
        <tr>
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
    }
  });
});

// close the database connection when the server is stopped
process.on('SIGINT', () => {
  db.close(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});
