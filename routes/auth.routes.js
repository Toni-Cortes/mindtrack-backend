const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // hashing
const jwt = require('jsonwebtoken'); 
const User = require('../models/Patient.model'); 
const { isAuthenticated } = require('../middleware/jwt.middleware'); // Middleware for protected routes

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'; //  .env

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // checking user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // checking password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Password nor email do not match' });
    }

    // jwt token creation
    const payload = { id: user._id, email: user.email};
    const token = jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', expiresIn: "1h"  });

    // return token
    return res.status(200).json({ token, message: 'Login successful' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong', error });
  }
});

// verification for whatever
router.get('/verify', isAuthenticated, (req, res) => {
  // protected route for testing
  return res.status(200).json({ message: 'Token is valid', user: req.payload });
});

module.exports = router;