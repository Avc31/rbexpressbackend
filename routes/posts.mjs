import express from "express";
import db from "../connectdb.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

router.get("/api/:resource/:id?", async (req, res) => {
    const { resource, id } = req.params;
    const collection = db.collection(resource);

    try {
        if (id) {
            const data = await collection.findOne({ _id: new ObjectId(id) });
            console.log(data)
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

export default router;