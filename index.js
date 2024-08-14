const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken')
require('dotenv').config()
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const port = process.env.PORT || 9000

const app = express()

const corsOption = {
    origin: ['http://localhost/5173', 'http://localhost/5174' ],
    Credential: true,
    optionSuccessStatus: 200,
}

// middleware
app.use(cors(corsOption))
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0cyoac0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        const allfoodData = client.db('assignment-11').collection('foods')
      
        // get all food from db 
        app.get('/allFood', async (req, res)=>{
            const result = await allfoodData.find().toArray()
            res.send(result)
        })















      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
    }
  }
  run().catch(console.dir);




app.get('/', (req, res) => {
    res.send("hello from assignment-11 server......")
} )

app.listen(port, ()=> console.log(`server running on port ${port}`))