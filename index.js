const dns = require('node:dns').promises;
dns.setServers(['8.8.8.8', '8.8.4.4']);

const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const port = 5000;

const uri = "mongodb+srv://tourism:XFnFSiDXyenH7uos@cluster0.5pnfm0z.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let bookingCollection;
let destinationCollection;

async function run() {
  try {
    await client.connect();

    const db = client.db('tourism');

    // Assign collection here
       bookingCollection = db.collection('users');
       destinationCollection = db.collection('destination')

    await client.db("admin").command({ ping: 1 });

    console.log("MongoDB connected successfully!");

  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

run();

app.get('/users', async (req, res) => {

  try {
    const result = await bookingCollection.find().toArray();

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Failed to get users"
    });
  }
});
// destination post method
 app.post('/destination', async(req, res)=>{
  const newDestination = req.body;
  const result = await destinationCollection.insertOne(newDestination)
  res.json(result)
 })

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});