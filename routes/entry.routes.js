const router = require("express").Router();
const Entry = require("../models/Entry.model");
const Journal = require("../models/Journal.model");

// Post a journal entry
router.post("/:journalId", async (req, res, next) => {
  try {
    const { journalId } = req.params;
    const { title, description, likes, dislikes, state, diet } = req.body;
    const entry = await Entry.create({
      journal: journalId,
      date: new Date(),
      title,
      description,
      likes,
      dislikes,
      state,
      diet
    });
    await Journal.findByIdAndUpdate(journalId, { $push: { entries: entry._id } });
    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

// Delete a journal entry
router.delete("/:journalId/:entryId", async (req, res, next) => {
  try {
    const { entryId } = req.params;
    await Entry.findByIdAndDelete(entryId);
    res.status(200).json({ message: "Entry deleted." });
  } catch (error) {
    next(error);
  }
});

// Fetch all entries from a journal
router.get("/:journalId", async (req, res, next) => {
  try {
    const { journalId } = req.params;
    const journal = await Journal.findById(journalId).populate('entries');
    res.json(journal.entries);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
