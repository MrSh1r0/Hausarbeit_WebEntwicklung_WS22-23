// import { createServer } from "http";
// import { promises as fs } from "fs";

// const host = "localhost";
const port = 8080;

/* const requestListener = function (req, res) {
  fs.readFile("webapp/dist/index.html")
    .then(contents => {
      res.setHeader("Content-Type", "text/html");
      res.writeHead(200);
      res.end(contents);
    })
    .catch(err => {
      res.writeHead(500);
      res.end(err);
    });
};

const server = createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
}); */

// Import Express and node-json-db
/* const express = require('express');
const JsonDB = require('node-json-db').JsonDB;
const Config = require('node-json-db/dist/lib/JsonDBConfig').Config; */
import express from 'express';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js';


// Create an instance of Express
const app = express();

// Create an instance of node-json-db
const db = new JsonDB(new Config('myDatabase', true, false, '/'));

// Use Express middleware to parse JSON data from requests
app.use(express.json());

// Create a route for GET requests to /
app.get('/', (req, res) => {
  // Read data from the database
  const data = db.getData('/');

  // Send data as JSON
  res.json(data);
});

// Create a route for POST requests to /submit
app.post('/submit', (req, res) => {
  // Get data from the request body
  const formData = req.body;

  // Save data to the database
  db.push('/formData[]', formData);

  // Send a response
  res.send('Data saved!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
