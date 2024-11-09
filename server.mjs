import express from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import connectToDatabase from './connectdb.mjs';
import { ObjectId } from 'mongodb';

const app = express();
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;

let db;
(async () => {
  db = await connectToDatabase();
})();

app.use(express.json());

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; 
  if (!token) {
    return res.status(403).json({ message: "Token is missing" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = decoded; 
    next();
  });
};


app.post('/api/login', async (req, res) => {
  const { username } = req.body;


  const user = { username };

  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.use('/api/:resource', authenticateJWT);

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
