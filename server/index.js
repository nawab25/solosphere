const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
require('dotenv').config()
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8000;

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://solosphere-548cf.web.app'],
  credentials: true,
  optionSuccessStatus: 200
}
//middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

//jwt token verify function
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) { return res.status(401).send({ message: 'Unauthorized access' }) }

  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: 'Unauthorized access' })
      }
      console.log(decoded);
      req.user = decoded;
      next();
    })
  }
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bo6cjhp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const jobsCollection = client.db('soloSphere').collection('jobs');
    const bidsCollection = client.db('soloSphere').collection('bids');

    //jwt 
    //create token and save it to cookie
    app.post('/jwt', async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '365d'
      });
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      }).send({ success: true });
    })

    //clear cookie after logout
    app.get('/logout', (req, res) => {
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 0
      }).send({ success: true });
    })

    //get data
    app.get('/jobs', async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.send(result);
    })

    //get single data by id
    app.get('/job/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    })

    //post bid data
    app.post('/bids', async (req, res) => {
      const bidData = req.body;
      //reject post if the same post is already exist
      const query = {
        email: bidData.email,
        jobId: bidData.jobId
      }
      const alreadyExists = await bidsCollection.findOne(query);
      console.log(alreadyExists);
      if (alreadyExists) {
        return res
          .status(404)
          .send('You have already placed a bid for this job')
      }
      const result = await bidsCollection.insertOne(bidData);
      //update bid count from jobcollections
      const bidCountQuery = { _id: new ObjectId(bidData.jobId) }
      const updateDoc = {
        $inc: { bid_count: 1 }
      }
      const updateBidCount = await jobsCollection.updateOne(bidCountQuery, updateDoc)
      console.log(updateBidCount);
      res.send(result);
    })

    //Get user data from bids data
    app.get('/my-bids/:email', verifyToken, async (req, res) => {
      const tokenEmail = req.user.email;
      const email = req.params.email;
      if (tokenEmail !== email) {
        return res.status(403).send({ message: 'Forbidden access' })
      }
      const query = { email: email }
      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    })

    //Get buyer data from bids data
    app.get('/bid-request/:email', async (req, res) => {
      const email = req.params.email;
      const query = { buyer_email: email }
      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    })

    //post job data
    app.post('/jobInfo', async (req, res) => {
      const jobData = req.body;
      const result = await jobsCollection.insertOne(jobData);
      res.send(result);
    })

    //get a specific buyer posted job data
    app.get('/specificJob/:email', async (req, res) => {
      const email = req.params.email;
      const query = { 'buyer.email': email };
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    })

    //delete data by id
    app.delete('/job/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    })

    //update job data
    app.put('/updateJob/:id', async (req, res) => {
      const id = req.params.id;
      const jobData = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...jobData
        }
      }
      const result = await jobsCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    //update bid Status
    app.patch('/updateStatus/:id', async (req, res) => {
      const id = req.params.id;
      const status = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: status
      }
      const result = await bidsCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    //get pagination data
    app.get('/all-jobs', async (req, res) => {
      const page = parseInt(req.query.page) - 1;
      const size = parseInt(req.query.size);
      const filter = req.query.filter;
      const sort = req.query.sort;
      const search = req.query.search;
      let query = {
        job_title: { $regex: search, $options: 'i' }
      }
      if (filter) query = { ...query, category: filter }
      let options = {}
      if (sort) options = { sort: { deadline: sort === 'asc' ? 1 : -1 } }
      const result = await jobsCollection.find(query, options).skip(page * size).limit(size).toArray();
      res.send(result);
    })

    //for pagination
    app.get('/job-count', async (req, res) => {
      const filter = req.query.filter;
      const search = req.query.search;
      let query = {
        job_title: { $regex: search, $options: 'i' }
      }
      if (filter) query = { ...query, category: filter }
      const count = await jobsCollection.countDocuments(query);
      res.send({ count });
    })
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Soloshphere Server is running")
})

app.listen(port, () => {
  console.log(`server is listening on port: ${port}`);
});