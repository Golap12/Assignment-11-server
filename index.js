const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');
require('dotenv').config()

const port = process.env.PORT || 9000

const app = express()

const corsOption = {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'https://assignment-11-5ce6f.web.app'],
    credentials: true,
    optionsSuccessStatus: 200,
};

// middleware
app.use(cors(corsOption))
app.use(express.json())
app.use(cookieParser())


// middleware function for jwt 
const verifyToken = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).send({ message: "Unauthorized Access" });

    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: "Unauthorized Access" });
            }
            req.user = decoded;
            next();
        });
    }
};

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

        // const allFoodData = client.db('assignment-11').collection('foods')
        const addFoodData = client.db('assignment-11').collection('addFoods')
        const purchaseFoodData = client.db('assignment-11').collection('purchaseFoods')
        const userFeedback = client.db('assignment-11').collection('userFeedBack')





        // generate token 
        app.post('/jwt', async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "1h"
            })
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
            })
                .send({ success: true })
        })

        // clear token after logout 
        app.get('/logout', async (req, res) => {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 0
            })
                .send({ success: true })

        })






        // get all food from db addFoodData
        app.get('/allFood', async (req, res) => {
            const result = await addFoodData.find().toArray()
            res.send(result)
        })

        // pagination 
        app.get('/top-selling-foods', async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 6;
            const topSellingFoods = await addFoodData.find({})
                .sort({ purchase_count: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .toArray();

            const totalItems = await addFoodData.countDocuments({});
            const totalPages = Math.ceil(totalItems / limit);

            res.send({
                topSellingFoods,
                totalPages,
                currentPage: page
            });

        });

        // search food api addFoodData
        app.get('/search-foods', async (req, res) => {
            const searchQuery = req.query.name;
            const query = { foodName: { $regex: searchQuery, $options: 'i' } };
            const result = await addFoodData.find(query).toArray();
            res.send(result);
        });


        // single product details addFoodData
        app.get('/food-details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await addFoodData.findOne(query);
            res.send(result);
        });



        // get data for user email addFoodData
        app.get('/food/user/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            const query = { 'madeBy': email };
            const result = await addFoodData.find(query).toArray();
            res.send(result);
        });


        // save Food data addFoodData
        app.post('/add-foods', async (req, res) => {
            const addFood = req.body
            const result = await addFoodData.insertOne(addFood)
            res.send(result)
        })



        // delete method addFoodData
        app.delete('/food/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await addFoodData.deleteOne(query);
            res.send(result);
        });



        // update method addFoodData
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


        // ---------------------------------------------------------- 
        // get user feedback 
        app.get('/feedback', async (req, res) => {
            const result = await userFeedback.find().toArray()
            res.send(result)
        })

        // save Feedback data 
        app.post('/feedbackAdd', async (req, res) => {
            const addFeedback = req.body
            const result = await userFeedback.insertOne(addFeedback)
            res.send(result)
        })

        // ---------------------------------------------------------------------- 

        // get all food from db purchaseFoodData
        app.get('/purchase/foods/:email', verifyToken, async (req, res) => {
            const tokenEmail = req.user.email
            const email = req.params.email;
            if (tokenEmail !== email) {
                return res.status(403).send({ message: "Forbidden Access" })
            }
            const query = { 'purchaseBy': email };
            const result = await purchaseFoodData.find(query).toArray();
            res.send(result)
        })

        // save Food data on purchase collection
        app.post('/purchase-foods', async (req, res) => {
            const purchaseFood = req.body
            const result = await purchaseFoodData.insertOne(purchaseFood)
            res.send(result)
        })


        // delete method purchaseFoodData
        app.delete('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await purchaseFoodData.deleteOne(query);
            res.send(result);
        });

        // ----------------------------------------------------------------- 








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