const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry.model');
const Journal = require('../models/Journal.model');
const Patient = require('../models/Patient.model');

// Post a journal entry
router.post('/entry', async (req, res, next) => {
  const { username, title, description, likes, dislikes, state, diet } = req.body;

  try {
    // Fetch the user by username and populate the journal field
    const user = await Patient.findOne({ username: username }).populate('journal');

    if (!user || !user.journal) {
      return res.status(404).json({ message: 'User or journal not found' });
    }

    // Create the new entry
    const entry = await Entry.create({
      journal: user.journal._id,
      date: new Date(),
      title,
      description,
      likes,
      dislikes,
      state,
      diet
    });

    // Update the journal to include the new entry
    await Journal.findByIdAndUpdate(user.journal._id, { $push: { entries: entry._id } });

    return res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

// Delete a journal entry
router.delete("/:entryId", async (req, res, next) => {
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

// Update a journal entry
router.put("/:entryId", async (req, res, next) => {
  try {
    const { entryId } = req.params;
    const updatedData = req.body;
    const updatedEntry = await Entry.findByIdAndUpdate(entryId, updatedData, { new: true });

    if (!updatedEntry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.status(200).json(updatedEntry);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
