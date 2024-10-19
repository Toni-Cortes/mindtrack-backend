const router = require("express").Router();
const Journal = require("../models/Journal.model");
const Patient = require("../models/Patient.model");
const Therapist = require("../models/Therapist.model");

// Middleware to validate the therapist code
const validateTherapistCode = async (req, res, next) => {
  const { loginCode } = req.body;
  const therapist = await Therapist.findOne({ 
    loginCode: loginCode });
  if (!therapist) {
    return res.status(400).json({ message: "Invalid code." });
  }
  req.therapist = therapist;
  next();
};

// Sign up patient (create patient with code validation)
router.post("/signup", validateTherapistCode, async (req, res, next) => {
  try {

    const { username, password } = req.body;
    const patient = await Patient.create({
      username,
      password,
      therapist: req.therapist._id
    });

    await Therapist.findByIdAndUpdate(req.therapist._id, { $push: { patients: patient._id } });

    //------------------------------------------------------------------------------

    const journal = await Journal.create({
      patient: patient._id,
      entries: [],
      createdAt: new Date()
    });

    await Patient.findByIdAndUpdate(patient._id, { journal: journal._id });

    //------------------------------------------------------------------------------

    const populatedPatient = await Patient.findById(patient._id)
    .populate({
      path: 'therapist',
      select: 'username' // Select only the username field from therapist
    })
    .populate({
      path: 'journal',
      select: 'selectedAt visibility' // Select only selectedAt and visibility from journal
    });
    
    res.status(201).json(populatedPatient);

  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// Delete patient
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await Patient.findByIdAndDelete(id);
    res.status(200).json({ message: "Patient deleted." });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

// Fetch all patients

router.get('/', async (req, res, next) => {
  try {
    let allPatients = await Patient.find()
    res.status(200).json(allPatients)
  } catch (err) {
    console.log(err)
    res.json(err)
  }
})

module.exports = router;