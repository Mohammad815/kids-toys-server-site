const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ns6st.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        console.log('database connected successfuflly')
        
      const database = client.db('baby_toys');
      const productsCollection = database.collection('products');
      const ordersCollection = database.collection("orders");
      const usersCollection = database.collection('users');
      const reviewCollection = database.collection('usersReview');

        //add ProductCollection
        app.post("/AddProduct", async (req, res) => {
            // console.log(req.body);
            const result = await productsCollection.insertOne(req.body);
            res.send(result);
         });
          // get all products
        app.get("/allProducts", async (req, res) => {
            const result = await productsCollection.find({}).toArray();
            res.send(result);
       });
        // single Product
        app.get("/singleProduct/:id", async (req, res) => {
            console.log(req.params.id);
            const result = await productsCollection
            .find({ _id: ObjectId(req.params.id) })
            .toArray();
            res.send(result[0]);
            // console.log(result);
        });
         //delete Product
       app.delete("/deleteProduct/:id",async(req,res)=>{
          
        console.log(req.params.id)

        const result = await productsCollection.deleteOne({_id:ObjectId(req.params.id),})
        // console.log(result);
        res.send(result)
      });

        // insert order and
        app.post("/addOrders", async (req, res) => {
            const result = await ordersCollection.insertOne(req.body);
            res.send(result);
        });
          /// all order
            app.get("/allOrders", async (req, res) => {
                // console.log("hello");
                const result = await ordersCollection.find({}).toArray();
                res.send(result);
            });
            //delete Product
       app.delete("/deleteOrder/:id",async(req,res)=>{
          
        console.log(req.params.id)

        const result = await ordersCollection.deleteOne({_id:ObjectId(req.params.id),})
        // console.log(result);
        res.send(result)
      });


          //  my order with email

            app.get("/myOrder/:email", async (req, res) => {
                console.log(req.params.email);
                const result = await ordersCollection
                .find({ email: req.params.email })
                .toArray();
                res.send(result);
            });
             // review
              app.post("/addReview", async (req, res) => {
                const result = await reviewCollection.insertOne(req.body);
                console.log(result)
                res.send(result);
              });
                 /// all review
            app.get("/allReview", async (req, res) => {
              // console.log("hello");
              const result = await reviewCollection.find({}).toArray();
              res.send(result);
          });

        // add register user information
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });
        // google sign in upsert in user
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
          
            res.json(result);
        });

        // user make admin
        app.put('/users/admin', async (req, res) => {
          const user = req.body;
          console.log('put',user)
          const filter = { email: user.email };
          const updateDoc = { $set: {role:'admin'} };
          const result = await usersCollection.updateOne(filter, updateDoc);
        
          res.json(result);
      });
      //check is user admin?
      app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin') {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
    })

    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir)



app.get('/', (req, res) => {
  res.send('Hello baby toys')
})

app.listen(port, () => {
  console.log(`listening at ${port}`)
})