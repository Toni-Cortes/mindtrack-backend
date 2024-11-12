const jwt = require('jsonwebtoken');
const Therapist = require('../models/Therapist.model');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';


// Middleware function to check if a request contains a valid JWT
const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1]; "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.payload = payload; 
    next(); 
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const isTherapist = async (req, res, next) => {
  try {
    const therapist = await Therapist.findById(req.payload.id);
    if (therapist) {
      next(); // verified as a therapist
    } else {
      return res.status(403).json({ message: 'Access forbidden: Therapist only' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = { isAuthenticated, isTherapist };
