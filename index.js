const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
require('dotenv').config()
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const port = process.env.PORT || 9000

const app = express()

const corsOption = {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
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

        const allFoodData = client.db('assignment-11').collection('foods')
        const addFoodData = client.db('assignment-11').collection('addFoods')




        // get all food from db 
        app.get('/allFood', async (req, res) => {
            const result = await allFoodData.find().toArray()
            res.send(result)
        })


        // top selling food 
        app.get('/top-selling-foods', async (req, res) => {

            const topSellingFoods = await allFoodData.find({})
                .sort({ purchase_count: -1 }).limit(6).toArray();
            res.send(topSellingFoods);

        });

        // single product details 
        app.get('/food-details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await allFoodData.findOne(query);
            res.send(result);
        });



        // get data for user email
        app.get('/food/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { 'addedBy': email };
            const result = await addFoodData.find(query).toArray();
            res.send(result);
        });


        // save Food data 
        app.post('/add-foods', async (req, res) => {
            const addFood = req.body
            const result = await addFoodData.insertOne(addFood)
            res.send(result)
        })


        // delete method 
        app.delete('/food/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await addFoodData.deleteOne(query);
            res.send(result);
        });



        
        // update method
        app.put('/food/user/:id', async (req, res) => {
            const id = req.params.id;
            const updatedData = req.body;
            const query = { _id: new ObjectId(id) };

            const updateDocument = {
                $set: updatedData,
            };

            const result = await addFoodData.updateOne(query, updateDocument);
            res.send(result);
        });







        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send("hello from assignment-11 server......")
})

app.listen(port, () => console.log(`server running on port ${port}`))