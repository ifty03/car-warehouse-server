const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

/* all middleware */
app.use(cors());
app.use(express.json());

/* all HTTP requests */

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tjsdk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    const stokeCollection = client.db("stokedb").collection("stoke");
    const myCollection = client.db("addDb").collection("myStoke");
    /* get 6 data from database */
    app.get("/stoke", async (req, res) => {
      const query = {};
      const cursor = stokeCollection.find(query).limit(6);
      const stokes = await cursor.toArray();
      res.send(stokes);
    });
    /* get all data from database */
    app.get("/manageStoke", async (req, res) => {
      const query = {};
      const page = +req.query.page;
      const size = +req.query.size;
      console.log(page, size);
      const cursor = stokeCollection
        .find(query)
        .skip(page * size)
        .limit(size);
      const stokes = await cursor.toArray();
      res.send(stokes);
    });

    /* get stokes quantity from database */
    app.get("/stokesCount", async (req, res) => {
      const count = await stokeCollection.estimatedDocumentCount({});
      res.send({ count });
    });

    /* get one data from database */
    app.get("/stoke/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await stokeCollection.findOne(query);
      res.send(result);
    });
    /* add a new data/stock in database */
    app.put("/addStoke", async (req, res) => {
      const stock = req.body;
      const tokenInfo = req.headers.authorization;
      const [email, accessToken] = tokenInfo.split(" ");
      let decoded = verifyToken(accessToken);
      const result = await myCollection.insertOne(stock);
      res.send(result);
    });
    /* get user selected stock */
    app.get("/myStock", async (req, res) => {
      const tokenInfo = req.headers.authorization;
      const [email, accessToken] = tokenInfo?.split(" ");
      const decoded = verifyToken(accessToken);
      console.log(accessToken);
      if (email === decoded.email) {
        const addedItem = await myCollection.find({ email: email }).toArray();
        res.send(addedItem);
      }
    });

    /* generate jwt token */
    app.post("/login", (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.SECRET_KEY);
      console.log(token);
      res.send({ token });
    });

    /* update a stoke */
    app.put("/stoke/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateStoke = req.body;
      const updateDoc = {
        $set: updateStoke,
      };
      const result = await stokeCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    /* delete a stoke from db */
    app.delete("/stoke/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await stokeCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // await client.close()
  }
};
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

/* verify token */
const verifyToken = (token) => {
  let email;
  jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
    if (err) {
      email = "unAuthorize access";
    }
    if (decoded) {
      email = decoded;
    }
  });
  return email;
};
