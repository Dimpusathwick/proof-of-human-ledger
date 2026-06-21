const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors()); 
app.use(express.json()); 

app.get('/', (req, res) => {
  res.send("Your Proof of Human backend server is officially up and running!");
});

app.use('/api', require('./routes/verify'));

if (!process.env.MONGO_URI) {
  console.error("CRITICAL ERROR: MONGO_URI is missing from your .env file!");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => {
    console.error(" MongoDB connection error:", err.message);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is flying smoothly on port ${PORT}`);
});