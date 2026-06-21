// models/Verification.js
const mongoose = require('mongoose');

// Define the blueprint template for our data structure
const VerificationSchema = new mongoose.Schema({
  fileHash: { 
    type: String, 
    required: true, 
    unique: true
  }, // <-- MAKE SURE THIS COMMA IS HERE!
  fileName: { 
    type: String, 
    required: true 
  }, // <-- AND THIS COMMA!
  humanScore: { 
    type: Number, 
    required: true 
  }, // <-- AND THIS COMMA!
  textSnippet: { 
    type: String 
  }, // <-- AND THIS COMMA!
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Export this blueprint so our server can use it
module.exports = mongoose.model('Verification', VerificationSchema);