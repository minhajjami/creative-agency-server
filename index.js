
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fileUpload = require('express-fileupload')
require('dotenv').config();
const app = express()
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }))
const port = 5000
const ObjectID = require('mongodb').ObjectID;


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fuyuk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const adminCollection = client.db(process.env.DB_NAME).collection("admins");
    const orderCollection = client.db(process.env.DB_NAME).collection("orders");
    const reviewCollection = client.db(process.env.DB_NAME).collection("reviews");
    const serviceCollection = client.db(process.env.DB_NAME).collection("services");

    // add admin
    app.post('/addAdmin', (req, res) => {
        adminCollection.insertOne(req.body)
            .then(result => {
                res.status(200).send(result.insertedCount > 0)
            })
    });

    app.get('/getAdmin', (req, res) => {
        const email = req.query.email;
        adminCollection.find({})
        adminCollection.find({ email: email })
            .toArray((err, documents) => {
                if (err) {
                    console.log(err);
                }
                else {
                    res.send(documents)
                }
            })
    });

    // add user order
    app.post('/addOrder', (req, res) => {

        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const serviceName = req.body.serviceName;
        const projectDetail = req.body.projectDetail;
        const price = req.body.price;
        const status = 'Pending';

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        orderCollection.insertOne({ name, email, serviceName, projectDetail, price, status, image })
            .then(result => {
                res.status(200).send(result.insertedCount > 0);
            })
    })

    // get all  orders
    app.get('/getUsersOrder', (req, res) => {
        orderCollection.find()
            .toArray((err, documents) => {
                res.status(200).send(documents);
            })
    });

    // Update  order status
    app.patch('/updateOrderStatus/:id', (req, res) => {
        orderCollection.updateOne({ _id: ObjectID(req.params.id) },
            {
                $set: { status: req.body.status }
            })
            .then(result => {
                res.send(result.modifiedCount > 0);
            })
    });

    // add services
    app.post('/addService', (req, res) => {

        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ title, description, image })
            .then(result => {
                res.status(200).send(result.insertedCount > 0);
            })
    });

    app.get('/getService', (req, res) => {
       serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.get('/getUserOrders', (req, res) => {
        const userEmail = req.query.email;
        orderCollection.find({ email: userEmail })
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/addReview', (req, res) => {
        const name = req.body.name;
        const companyName = req.body.companyName;
        const message = req.body.message;
        const image = req.body.image;

        reviewCollection.insertOne({ name, companyName, message, image })
            .then(result => {
                res.status(200).send(result.insertedCount > 0);
            })
    });

    //get Client Feedback
    app.get('/getClientFeedback', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || port)

