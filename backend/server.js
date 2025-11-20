require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();


app.use(cors());
app.use(bodyParser.json());

// Routes
const moodRoutes = require("./routes/moodRoutes");
const auth = require("./middleware/auth");
app.use("/api/moods", auth, moodRoutes);
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

mongoose.set("debug", true);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error(err));

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
