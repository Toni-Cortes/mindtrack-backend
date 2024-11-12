const mongoose = require('mongoose');
const { Schema } = mongoose;


const entrySchema = new Schema({
    journal: { type: Schema.Types.ObjectId, ref: 'Journal', required: true }, 
    date: { type: Date, required: true }, 
    title: { type: String, default: Date.now}, 
    description: { type: String, required: true }, 
    likes: { type: String, default: '' }, 
    dislikes: { type: String, default: ''}, 
    state: { 
      type: String, 
      enum: ['Happy', 'Sad', 'Angry', 'Calm'], 
      required: true 
    }, 
    diet: { type: String } 
  });
  
  const Entry = mongoose.model('Entry', entrySchema);
  module.exports = Entry;
  