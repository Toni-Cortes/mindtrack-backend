const router = require("express").Router();
const { isAuthenticated, isTherapist } = require("../middleware/jwt.middleware");
const Patient = require("../models/Patient.model");
const Task = require("../models/Task.model");
const Therapist = require("../models/Therapist.model");



// code generator
const generateLoginCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Sign up therapist (create therapist)
router.post("/signup", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const loginCode = generateLoginCode(); // Generate the random code

    const therapist = await Therapist.create({ username, password, loginCode });
    res.status(201).json(therapist);

  } catch (error) {
    console.log(error);
    res.json(error)
  }
});

// Delete therapist
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await Therapist.findByIdAndDelete(id);
    res.status(200).json({ message: "Therapist deleted." });
  } catch (error) {
    next(error);
  }
});

// Fetch all therapists
router.get("/", async (req, res, next) => {
  try {
    const therapists = await Therapist.find();
    res.json(therapists);
  } catch (error) {
    next(error);
  }
});


// Fetch all therapist patients

router.get('/:therapistId/patients', isAuthenticated, isTherapist, async (req, res, next) => {
  try {
    const { therapistId } = req.params;
    const therapist = await Therapist.findById(therapistId).populate('patients');
    res.json(therapist.patients);
  } catch (err) {
    console.log(err)
    res.status(400).json(err)
  }
})

// Fetch all therapists
router.get("/", async (req, res, next) => {
  try {
    const therapists = await Therapist.find(); res.json(therapists);
  } catch (error) {
    next(error);
  }
});

//posting tasks

router.post('/:patientId/tasks', isAuthenticated, isTherapist, async (req, res) => {
  const { patientId } = req.params;
  const { title, description } = req.body;

  try {

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const newTask = await Task.create({ title, description });

    await Patient.findByIdAndUpdate(
      patientId,
      { $push: { toDo: newTask._id } },
      { new: true }
    );

    res.status(201).json({ message: 'Task added to patient', task: newTask });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding task to patient', error });
  }
});

module.exports = router;