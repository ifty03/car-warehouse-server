const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
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
    app.get("/stoke", async (req, res) => {
      const query = {};
      const cursor = stokeCollection.find(query);
      const stokes = await cursor.toArray();
      res.send(stokes);
    });
  } finally {
    // await client.close()
  }
};
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});