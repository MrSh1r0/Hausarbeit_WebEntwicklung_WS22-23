import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';

const port = 8080;

// Create an instance of Express
const app = express();

const url = 'mongodb://localhost:27017';
const dbName = 'test';
const collectionName = 'data';

// Connect to the MongoDB database
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Connected to database');
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  // Set up the Express app to use the body-parser middleware
  app.use(bodyParser.urlencoded({ extended: true }));

  // Serve the static files from the public directory
  app.use(express.static('public'));

  // Route to handle form submission
  app.post('/submit', async (req, res) => {
    try {
      // Insert the data into the database
      const result = await collection.insertOne(req.body);
      res.json(result.ops[0]);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });

  // Route to retrieve the data from the database
  app.get('/data', async (req, res) => {
    try {
      // Retrieve the data from the database and return it as JSON
      const cursor = collection.find();
      const data = await cursor.toArray();
      res.json(data);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });

  // Start the server
  app.listen(port, () => console.log('Server started on port 8080'));
});
