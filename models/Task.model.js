const mongoose = require('mongoose');
const { Schema } = mongoose;


const taskSchema = new Schema({
    title: { type: String, required: true }, 
    description: { type: String, required: true }, 
    isCompleted: { type: Boolean, default: false }, 
    assignedDate: { type: Date, default: Date.now } 
  });
  
  const Task = mongoose.model('Task', taskSchema);
  module.exports = Task;
  