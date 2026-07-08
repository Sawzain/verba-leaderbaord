const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Replace with your MongoDB Atlas connection string
mongoose
  .connect(
    "mongodb+srv://verba_admin:VerbaLeaderBoard@verbacluster.fykxznn.mongodb.net/?appName=VerbaCluster",
  )
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Could not connect to MongoDB", err));
const Score = require("./Score"); // Ensure you have imported your model here

app.get("/api/leaderboard", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const [scores, total] = await Promise.all([
      Score.find().sort({ score: -1 }).skip(skip).limit(limit),
      Score.countDocuments(),
    ]);

    res.json({
      scores,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch scores" });
  }
});

// Define a simple Schema for your members
const MemberSchema = new mongoose.Schema({
  name: String,
  points: Number,
});
// const Member = mongoose.model("Member", MemberSchema);
// app.get("/", (req, res) => {
//   res.send("Leaderboard Server is up and running!");
// });
// GET: Fetch all members (Using Score model)
// ... (Your existing imports and DB connection)

// GET: Fetch all members (using Score model)
app.get("/api/members", async (req, res) => {
  try {
    const scores = await Score.find();
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// POST: Add a new member (using Score model)
app.post("/api/members", async (req, res) => {
  try {
    const newEntry = new Score(req.body);
    await newEntry.save();
    res.json(newEntry);
  } catch (err) {
    res.status(500).json({ error: "Failed to add entry" });
  }
});

// // DELETE: Remove by name
// app.delete("/api/members/:name", async (req, res) => {
//   try {
//     await Score.deleteOne({ username: req.params.name }); // Match your Schema field
//     res.sendStatus(204);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to delete" });
//   }
// });

// // PUT: Update points/score by name
// app.put("/api/members/:name", async (req, res) => {
//   try {
//     const updated = await Score.findOneAndUpdate(
//       { username: req.params.name }, // Match your Schema field
//       { score: req.body.points },
//       { new: true },
//     );
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to update" });
//   }
// });
// DELETE: Remove by username
app.delete("/api/members/:name", async (req, res) => {
  try {
    await Score.deleteOne({ username: req.params.name });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

// PUT: Update score by username
app.put("/api/members/:name", async (req, res) => {
  try {
    // We now use req.body.score to match the model field name
    const updated = await Score.findOneAndUpdate(
      { username: req.params.name },
      { score: req.body.score },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
