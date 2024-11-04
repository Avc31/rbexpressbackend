import express from 'express';
import 'dotenv/config';
import connectToDatabase from './connectdb.mjs';
import { ObjectId } from 'mongodb';

const app = express();
const PORT = process.env.PORT;

let db;
(async () => {
  db = await connectToDatabase();
})();

app.use(express.json());

// Routes

app.get("/api/:resource/:id?", async (req, res) => {
  const { resource, id } = req.params;
  const collection = db.collection(resource);

  try {
    if (id) {
      const data = await collection.findOne({ _id: new ObjectId(id) });

      if (!data) {
        return res.status(404).json({ message: `${resource.slice(0, -1)} not found` });
      }
      return res.status(200).json(data);
    } else {

      const results = await collection.find({}).toArray();
      return res.status(200).json(results);
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving data", error: error.message });
  }
});


app.post('/api/:resource', async (req, res) => {
  const { resource } = req.params;
  const collection = db.collection(resource);
  try {
    const data = req.body;
    const result = await collection.insertOne(data);
    res.status(201).json({ message: `${resource.slice(0, -1)} added`, data: { ...data, _id: result.insertedId } });
  } catch (error) {
    res.status(500).json({ message: 'Error adding data', error: error.message });
  }
});

app.put('/api/:resource/:id', async (req, res) => {
  const { resource, id } = req.params;
  const collection = db.collection(resource);

  try {
    const updateData = req.body;
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: `${resource.slice(0, -1)} not found` });
    }

    res.status(200).json({ message: `${resource.slice(0, -1)} updated successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Error updating data', error: error.message });
  }
});

app.delete('/api/:resource/:id', async (req, res) => {
  const { resource, id } = req.params;
  const collection = db.collection(resource);

  try {

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: `${resource.slice(0, -1)} not found` });
    }

    res.status(200).json({ message: `${resource.slice(0, -1)} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting data', error: error.message });
  }
});


app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
