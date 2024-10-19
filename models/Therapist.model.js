const mongoose = require('mongoose');
const { Schema } = mongoose;


const therapistSchema = new Schema({
    username: { type: String, required: true, unique: true }, 
    password: { type: String, required: true }, 
    patients: [{ type: Schema.Types.ObjectId, ref: 'Patient' }],
    loginCode: { type: String, required:true, unique: true } 
  });
  
  const Therapist = mongoose.model('Therapist', therapistSchema);
  module.exports = Therapist;
  