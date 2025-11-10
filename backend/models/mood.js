const mongoose = require("mongoose");

const MoodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  mood: {
    type: String,
    required: true,
    enum: ["☀️ Happy", "🌧️ Sad", "⚡ Angry", "🌤️ Calm", "🌈 Excited", "🌫️ Confused", "🌙 Tired"],
  },
  note: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  lastEdited: {
    type: Date, // Stores when the entry was last updated
    default: null,
  },
});

MoodSchema.index({ user: 1, date: -1 });   // Faster "my moods sorted by date"

module.exports = mongoose.model("Mood", MoodSchema);
