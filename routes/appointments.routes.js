// routes/appointments.js
const express = require('express');
const Appointment = require('../models/Appointment.model');
const { isAuthenticated } = require("../middleware/jwt.middleware");
const router = express.Router();

// Add an appointment
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { patientId, dateTime } = req.body;
        const therapistId = req.user.id; // Get therapist ID from the logged-in user

        const appointment = new Appointment({
            patientId,
            therapistId,
            dateTime,
            status: 'Scheduled',
        });
        await appointment.save();
        res.status(201).json(appointment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get the next appointment for a patient
router.get('/:patientId/next', isAuthenticated, async (req, res) => {
    try {
        const currentDate = new Date(); // Get the current date and time

        const appointment = await Appointment.findOne({
            patientId: req.params.patientId,
            status: { $in: ['Scheduled', 'Will Attend', 'Will Not Attend'] },
            dateTime: { $gte: currentDate } // Only select appointments with a future date
        })
        .sort({ dateTime: 1 }) // Sort by dateTime in ascending order (earliest first)
        .limit(1); // Limit the results to 1 (next appointment)

        if (!appointment) {
            return res.status(404).json({ message: "No upcoming appointment found." });
        }

        res.json(appointment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cancel an appointment (therapist only)
router.delete('/:appointmentId/cancel', isAuthenticated, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        // Therapist cancels the appointment
        appointment.status = 'Canceled';
        await appointment.save();
        res.json(appointment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Change appointment status (patient only)
router.put('/:appointmentId/status', isAuthenticated, async (req, res) => {
    try {
        const { status } = req.body; // 'Will Attend' or 'Will Not Attend'
        const appointment = await Appointment.findById(req.params.appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        // Ensure patient can only update their own appointment
        if (appointment.patientId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to change this appointment status' });
        }
        appointment.status = status;
        await appointment.save();
        res.json(appointment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
