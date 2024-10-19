const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const journalSchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  entries: [{ type: Schema.Types.ObjectId, ref: "Entry" }],
  createdAt: { type: Date, default: Date.now },
  visibility: { type: String, enum: ["public", "private"], default: "private" } 
});

const Journal = mongoose.model("Journal", journalSchema);
module.exports = Journal;
