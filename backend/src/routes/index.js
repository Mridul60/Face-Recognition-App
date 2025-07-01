const express = require('express');
const { loginHandler } = require("../modules/auth");
const { facialHandler } = require("../modules/facial");
const { adaptRequest, sendResponse } = require('../util/http');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Multer config
const upload = multer({ dest: 'uploads/' });

// Login route
router.all("/auth/login", async (req, res) => {
  const httpRequest = adaptRequest(req);
  const result = await loginHandler(httpRequest);
  return sendResponse(res, result);
});

// Facial descriptor check route
router.get("/facial/check/:userId", async (req, res) => {
  const httpRequest = adaptRequest(req);
  const result = await facialHandler(httpRequest);
  return sendResponse(res, result);
});

router.post('/upload-face', upload.single('image'), (req, res) => {
  const filePath = req.file.path;

  exec(`python3 python/match_face.py ${filePath}`, (error, stdout, stderr) => {
    fs.unlinkSync(filePath); // Cleanup temp file

    if (error) {
      console.error(stderr);
      return res.status(500).json({ error: 'Face match error' });
    }

    try {
      const result = JSON.parse(stdout);
      res.json(result);
      console.log('Match result:', result);
    } catch (err) {
      res.status(500).json({ error: 'Invalid match response' });
    }
  });
});

module.exports = router;

