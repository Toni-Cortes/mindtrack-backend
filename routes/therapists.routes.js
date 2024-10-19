const router = require("express").Router();
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

router.get('/:therapistId/patients', async (req, res, next)=>{
    try{
        const { therapistId } = req.params;
        const therapist = await Therapist.findById(therapistId).populate('patients');
        res.json(therapist.patients);
    }catch(err){
        console.log(err)
        res.status(400).json(err)
    }
})

module.exports = router;
