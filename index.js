const dns = require('node:dns').promises;
dns.setServers(['8.8.8.8', '8.8.4.4']);

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');


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

const JWKS = createRemoteJWKSet(
  new URL('http://localhost:3000/api/auth/jwks')
);

const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    console.log(payload);
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden" });
  }
};


let bookingCollection;
let destinationCollection;

async function run() {
  try {
    await client.connect();

    const db = client.db('tourism');

    // Assign collection here
       bookingCollection = db.collection('bookings');
       destinationCollection = db.collection('destination')

    await client.db("admin").command({ ping: 1 });

    console.log("MongoDB connected successfully!");

  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

run();

app.get('/destination', async (req, res) => {

  try {
    const result = await destinationCollection.find().toArray();

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
  // for details page 
   app.get('/destination/:id', verifyToken, async(req,res)=>{
        const {id} = req.params;
        const result = await destinationCollection.findOne({_id:new ObjectId(id)})
        res.json(result)
   })

  //  for delete
  app.delete('/destination/:id', async(req,res)=>{
   const {id}=req.params;
   const result =await destinationCollection.deleteOne({_id:new ObjectId(id)});
   res.json(result)
  })

  // for update
   app.patch('/destination/:id', async(req,res)=>{
    const {id}=req.params;
    const updateData =req.body;
    const result = await destinationCollection.updateOne({_id: new ObjectId (id)},
  {$set:updateData});
  res.json(result)
   })

   app.get("/booking/:userId", async (req, res) => {
      const { userId } = req.params;

      const result = await bookingCollection.find({ userId: userId }).toArray();

      res.json(result);
    });
 
   app.post('/booking',  verifyToken, async(req,res)=>{
   const bookingData = req.body;
   const result = await bookingCollection.insertOne(bookingData)
   res.json(result)
   })

   app.delete('/booking/:bookingId', verifyToken,  async(req,res)=>{
    const {bookingId} = req.params;
    const result = await bookingCollection.deleteOne({_id:new ObjectId(bookingId)})
    res.json(result)
   })
 
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

