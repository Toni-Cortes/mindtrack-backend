const router = require("express").Router();
const Journal = require("../models/Journal.model");
const Entry = require("../models/Entry.model");
const Patient = require("../models/Patient.model");




router.get('/entries/:username', async (req, res, next) => {
    const { username } = req.params;
    try {
      const user = await Patient.findOne({ username }).populate('journal');
      if (!user || !user.journal) {
        return res.status(404).json({ message: 'User or journal not found' });
      }
      const entries = await Entry.find({ journal: user.journal._id });
      res.status(200).json({ entries });
    } catch (error) {
      next(error);
    }
  });







router.get("/:patientId", async (req, res, next) => {
    try {
        const { patientId } = req.params;


        const journal = await Journal.findOne({ patient: patientId }).populate("entries");

        if (!journal) {
            return res.status(404).json({ message: "Journal not found." });
        }

        // Check if the journal is private
        if (journal.visibility === "private") {
            // Fetch only the dates and moods of submitted entries
            const entryDetails = journal.entries.map(entry => ({
                date: entry.date,
                mood: entry.state,
            }));
            return res.status(200).json({ message: "Journal is private.", entryDetails });
        }

        // If public, return the full journal
        res.json(journal);
    } catch (error) {
        next(error);
    }
});


router.patch("/:patientId/visibility", async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const { visibility } = req.body;

        const validVisibilities = ["public", "private"];
        const isValidVisibility = validVisibilities.includes(visibility);

        if (!isValidVisibility) {
            return res.status(400).json({ message: "Invalid visibility option." });
        }

        // Find the patient's journal and update the visibility
        const journal = await Journal.findOneAndUpdate(
            { patient: patientId },
            { visibility: visibility },
            { new: true } 
        );

        if (!journal) {
            return res.status(404).json({ message: "Journal not found." });
        }

        res.json({ message: "Visibility updated successfully.", journal });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

