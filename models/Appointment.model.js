// models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
    dateTime: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['Scheduled', 'Will Attend', 'Will Not Attend', 'Canceled'], 
        default: 'Scheduled' 
    },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);

