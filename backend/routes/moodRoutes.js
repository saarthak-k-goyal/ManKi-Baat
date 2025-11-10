function startTimer() {
  return process.hrtime();
}

function endTimer(start) {
  const diff = process.hrtime(start);
  return Math.round((diff[0] * 1e9 + diff[1]) / 1e6); // milliseconds
}

const express = require("express");
const router = express.Router();
const Mood = require("../models/mood");
const logger = require("../logger");

// Add mood
router.post("/", async (req, res) => {
  const t = startTimer();
  try {
    const newMood = new Mood({ ...req.body, user: req.userId });
    await newMood.save();

    logger.info(
      `ADD_MOOD user=${req.userId} mood="${req.body.mood}" duration=${endTimer(t)}ms`
    );

    res.json(newMood);
  } catch (err) {
    logger.error(
      `ADD_MOOD_FAILED user=${req.userId} error="${err.message}" duration=${endTimer(t)}ms`
    );
    res.status(400).json({ error: err.message });
  }
});

// Get moods with filtering, sorting & pagination
router.get("/", async (req, res) => {
 const t = startTimer();
 try {
  const search = req.query.search || "";
  const sort = req.query.sort || "date_desc";
  const limit = parseInt(req.query.limit) || 20;
  const page = parseInt(req.query.page) || 1;
  const from = req.query.from || "";
  const to = req.query.to || "";

    // Base query ALWAYS includes the user
  let query = { user: req.userId };

    // We combine all filters using $and
    const filters = [{ user: req.userId }];

  // Date Range Filter
  if (from || to) {
      const dateFilter = { date: {} };
   if (from) dateFilter.date.$gte = new Date(from);
   if (to) dateFilter.date.$lte = new Date(to);
      filters.push(dateFilter);
  }

  // Search Filter (using $regex for partial match)
  if (search.trim() !== "") {
      filters.push({
        $or: [
          { note: { $regex: search, $options: "i" } }, // "i" for case-insensitive
          { mood: { $regex: search, $options: "i" } }
        ]
      });
  }

    // Final query combines all filters
    query = { $and: filters };
    
  // Sorting
  const sortOption = {
   date_asc: { date: 1 },
   date_desc: { date: -1 },
   mood_asc: { mood: 1 },
   mood_desc: { mood: -1 }
  }[sort] || { date: -1 };

  const skip = (page - 1) * limit;

  const moods = await Mood.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

  logger.info(
   `FETCH_MOODS user=${req.userId} results=${moods.length} search="${search}" sort=${sort} page=${page} limit=${limit} duration=${endTimer(t)}ms`
  );

  res.json(moods);

 } catch (err) {
  logger.error(
   `FETCH_MOODS_FAILED user=${req.userId} error="${err.message}" duration=${endTimer(t)}ms`
  );
  res.status(500).json({ error: err.message });
 }
});

// Get single mood by ID
router.get("/:id", async (req, res) => {
  const t = startTimer();
  try {
    const mood = await Mood.findOne({ _id: req.params.id, user: req.userId });

    if (!mood) {
      logger.warn(
        `MOOD_NOT_FOUND user=${req.userId} moodId=${req.params.id} duration=${endTimer(t)}ms`
      );
      return res.status(404).json({ error: "Mood not found" });
    }

    logger.info(
      `FETCH_SINGLE_MOOD user=${req.userId} moodId=${req.params.id} duration=${endTimer(t)}ms`
    );

    res.json(mood);
  } catch (err) {
    logger.error(
      `FETCH_SINGLE_MOOD_FAILED user=${req.userId} moodId=${req.params.id} error="${err.message}" duration=${endTimer(t)}ms`
    );
    res.status(500).json({ error: err.message });
  }
});

// Update mood
router.put("/:id", async (req, res) => {
  const t = startTimer();
  try {
    const updated = await Mood.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { ...req.body, lastEdited: new Date() },
      { new: true }
    );

    logger.info(
      `UPDATE_MOOD user=${req.userId} moodId=${req.params.id} duration=${endTimer(t)}ms`
    );

    res.json(updated);
  } catch (err) {
    logger.error(
      `UPDATE_MOOD_FAILED user=${req.userId} moodId=${req.params.id} error="${err.message}" duration=${endTimer(t)}ms`
    );
    res.status(400).json({ error: err.message });
  }
});

// Delete mood
router.delete("/:id", async (req, res) => {
  const t = startTimer();
  try {
    await Mood.findOneAndDelete({ _id: req.params.id, user: req.userId });

    logger.info(
      `DELETE_MOOD user=${req.userId} moodId=${req.params.id} duration=${endTimer(t)}ms`
    );

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    logger.error(
      `DELETE_MOOD_FAILED user=${req.userId} moodId=${req.params.id} error="${err.message}" duration=${endTimer(t)}ms`
    );
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
