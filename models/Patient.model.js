const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true }, 
  password: { type: String, required: true }, 
  status: { type: String, default: 'ongoing' }, 
  therapist: { type: Schema.Types.ObjectId, ref: 'Therapist' }, 
  journal: { type: Schema.Types.ObjectId, ref: 'Journal' }, 
  toDo: [{ type: Schema.Types.ObjectId, ref: 'Task' }] 
});

const Patient = mongoose.model('Patient', userSchema);

module.exports = Patient;
