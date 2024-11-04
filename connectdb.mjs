import { MongoClient } from "mongodb";
import 'dotenv/config';

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db('recipe_book'); // database name
  } catch (error) {
    console.error("Could not connect to MongoDB Atlas:", error);
    throw error;
  }
}

export default connectToDatabase;