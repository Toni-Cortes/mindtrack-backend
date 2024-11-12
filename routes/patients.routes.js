const router = require("express").Router();
const Journal = require("../models/Journal.model");
const Patient = require("../models/Patient.model");
const Task = require("../models/Task.model");
const Therapist = require("../models/Therapist.model");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';


// Middleware to validate the therapist code
const validateTherapistCode = async (req, res, next) => {
  const { loginCode } = req.body;
  const therapist = await Therapist.findOne({ 
    loginCode: loginCode });
  if (!therapist) {
    return res.status(400).json({ message: "Invalid code" });
  }
  req.therapist = therapist;
  next();
};

// Sign up patient (create patient with code validation)
router.post("/signup", validateTherapistCode, async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if username already exists
    const existingUser = await Patient.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const patient = await Patient.create({
      username,
      password: hashedPassword, // Use hashed password
      therapist: req.therapist._id,
    });

    await Therapist.findByIdAndUpdate(req.therapist._id, { $push: { patients: patient._id } });

    const journal = await Journal.create({
      patient: patient._id,
      entries: [],
      createdAt: new Date()
    });

    await Patient.findByIdAndUpdate(patient._id, { journal: journal._id });

    const populatedPatient = await Patient.findById(patient._id)
      .populate({
        path: 'therapist',
        select: 'username'
      })
      .populate({
        path: 'journal',
        select: 'selectedAt visibility'
      });

    const payload = { id: patient._id, username: patient.username };
    const token = jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', expiresIn: "1h" });

    res.status(201).json({ token, patient: populatedPatient });
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

router.get('/:patientId', async (req, res, next) => {
  try {
      const { patientId } = req.params;
      const patient = await Patient.findById(patientId)
          .populate({
              path: 'journal',
              populate: { path: 'entries' } // Populate entries within the journal
          })
          .populate('toDo');

      if (!patient) {
          return res.status(404).json({ message: 'Patient not found' });
      }

      res.json(patient);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong', error });
  }
});

// GET tasks by username
router.get('/:username/tasks', async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await Patient.findOne({ username }).populate('toDo');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ tasks: user.toDo });
  } catch (error) {
    next(error);
  }
});

// Update task completion status
router.put('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { isCompleted } = req.body;

  try {
    const updatedTask = await Task.findByIdAndUpdate(taskId, { isCompleted }, { new: true });
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating task', error });
  }
});

module.exports = router;




