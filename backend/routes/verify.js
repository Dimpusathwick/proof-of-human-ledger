// routes/verify.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const sharp = require('sharp'); // Advanced image processor tool
const Verification = require('../models/Verification');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- AUXILIARY FUNCTION: Run Image Error Level Analysis (ELA) ---
async function analyzeImageAuthenticity(imageBuffer) {
  try {
    // 1. Load raw metadata to analyze dimensions and potential compression details
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    // 2. Generate a re-compressed JPEG buffer at 90% quality baseline
    const compressedBuffer = await image.jpeg({ quality: 90 }).toBuffer();

    // 3. Extract raw pixel data arrays from both original and re-compressed images
    const origRaw = await sharp(imageBuffer).resize(100, 100, { fit: 'fill' }).raw().toBuffer();
    const compRaw = await sharp(compressedBuffer).resize(100, 100, { fit: 'fill' }).raw().toBuffer();

    // 4. Mathematical Variance analysis loop across pixel channels
    let totalPixelDeviation = 0;
    for (let i = 0; i < origRaw.length; i++) {
      totalPixelDeviation += Math.abs(origRaw[i] - compRaw[i]);
    }

    const averageDeviation = totalPixelDeviation / origRaw.length;

    let score = 100;
    if (averageDeviation < 0.8) {
      score = 45;
    } else if (averageDeviation > 8.0) {
      score = 55;
    } else {
      score = 100 - (averageDeviation * 4);
    }

    return Math.max(15, Math.min(100, Math.round(score)));
  } catch (err) {
    console.error("Image Forensic Processing Error:", err);
    return 50; 
  }
}

router.post('/verify', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a valid asset file." });
    }

    const mimeType = req.file.mimetype;
    let humanScore = 85;
    let textContentSnippet = "";

    const fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

    if (mimeType.startsWith('image/')) {
      humanScore = await analyzeImageAuthenticity(req.file.buffer);
      textContentSnippet = `[Binary Image Matrix Asset] Type: ${mimeType}, Size: ${(req.file.size / 1024).toFixed(1)} KB`;
      
    } else {
      const textContent = req.file.buffer.toString('utf-8').trim();
      if (!textContent || textContent.length < 5) {
        return res.status(400).json({ error: "Document content is too short for analysis." });
      }

      textContentSnippet = textContent.slice(0, 150);
      let calculatedTextScore = 100;
      const lowercaseText = textContent.toLowerCase();

      const maxRepeatedLetters = /(.)\1{4,}/g; 
      if (maxRepeatedLetters.test(lowercaseText)) calculatedTextScore -= 40;

      const aiBuzzwords = ['in conclusion', 'furthermore', 'moreover', 'delve', 'tapestry', 'revolutionize', 'crucial role'];
      aiBuzzwords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = lowercaseText.match(regex);
        if (matches) calculatedTextScore -= (matches.length * 10);
      });

      const sentences = textContent.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
      if (sentences.length >= 2) {
        const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
        const meanLength = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length;
        const variance = sentenceLengths.map(len => Math.pow(len - meanLength, 2)).reduce((sum, val) => sum + val, 0) / sentenceLengths.length;
        const standardDeviation = Math.sqrt(variance);

        if (standardDeviation < 3.0) calculatedTextScore -= 30;
        else if (standardDeviation > 6.0) calculatedTextScore += 10;
      }

      humanScore = calculatedTextScore;
    }

humanScore = Math.max(0, Math.min(100, Math.round(humanScore)));

if (isNaN(humanScore)) {
  humanScore = 85; 
}

    const existingAsset = await Verification.findOne({ fileHash });
    if (existingAsset) {
      return res.status(200).json({
        message: "This exact digital file signature has already been locked to the registry ledger previously!",
        data: existingAsset
      });
    }

    const newVerification = new Verification({
      fileHash,
      fileName: req.file.originalname,
      humanScore,
      textSnippet: textContentSnippet
    });

    await newVerification.save();
    res.status(201).json({
      message: "Verification asset successfully locked to ledger!",
      data: newVerification
    });

  } catch (error) {
    console.error("Master Processing Exception:", error);
    res.status(500).json({ error: "Internal processing engine system crash error encountered." });
  }
});

router.get('/verify/:id', async (req, res) => {
  try {
    const asset = await Verification.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: "No matching ledger certificate found." });
    res.json({ message: "Certificate found!", data: asset });
  } catch (error) {
    res.status(400).json({ error: "Invalid Ledger ID format sequence requested." });
  }
});

module.exports = router;