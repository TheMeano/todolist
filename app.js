const express = require("express");
const { times } = require("lodash");
const app = express();
const date = require(__dirname + "/date.js");
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

const uri = "<<YOUR MONGODB ATLAS URI>>";
const client = new MongoClient(uri, { useNewUrlParser: true });

let items = []
let workItems = []

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get('/', async (req, res) => {
  try {
    await client.connect();
    const database = client.db();
    const todolist = database.collection("todolist");
    const items = await todolist.find().toArray(); // Fetch all items from the collection

    var day = date.getDay();
    res.render('list', { listTitle: day, newListItem: items });
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
});

app.post("/", async function (req, res) {
  let item = req.body.newItem;

  try {
    await client.connect();
    const database = client.db();
    const todolist = database.collection("todolist");
    const result = await todolist.insertOne({ goal: item });
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }

  if (req.body.list === "Work") {
    workItems.push(item)
    res.redirect("/work")
  } else {
    items.push(item)
    res.redirect("/")
  }
});
// ... your existing code ...

// // POST route for deleting an item
app.post("/delete", async function (req, res) {
  const itemId = req.body.itemId;
  console.log("itemId:", itemId); // For debugging

  try {
    await client.connect();
    const database = client.db();
    const todolist = database.collection("todolist");
    const result = await todolist.deleteOne({ _id: new ObjectId(itemId) });
    console.log(`A document was deleted with the _id: ${itemId}`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }

  res.redirect("/");
});

app.get("/:customListName", async (req, res) => {
  const customListName = req.params.customListName;

  try {
    await client.connect();
    const database = client.db();
    const todolist = database.collection(customListName);
    const items = await todolist.find({ listTitle: customListName }).toArray();

    res.render("customList", { listTitle: customListName, newListItem: items, customListName : customListName });
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
});

app.post("/:customListName", async function (req, res) {
  const customListName = req.params.customListName;
  const item = req.body.newItem;

  try {
    await client.connect();
    const database = client.db();
    const todolist = database.collection(customListName);
    const result = await todolist.insertOne({ listTitle: customListName, goal: item });
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }

  res.redirect("/" + customListName);
});

app.post("/:customListName/delete", async function (req, res) {
  const itemId = req.body.itemId;
  console.log("itemId:", itemId); 
  const customListName = req.params.customListName

  try {
    await client.connect();
    const database = client.db();
    const todolist = database.collection(customListName);
    const result = await todolist.deleteOne({ _id: new ObjectId(itemId) });
    console.log(`A document was deleted with the _id: ${itemId}`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }

  res.redirect("/" + customListName);
});


app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work", newListItem: workItems });
});

app.get("/about", function (req, res) {
  res.render("list");
});

app.listen(2000, () => console.log("Server running on port 2000"));
