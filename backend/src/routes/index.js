const express = require('express');
const path = require('path');
const multer = require('multer');

const {
  loginHandler
} = require("../modules/auth");

const {
  faceMatchHandler,
  faceRegistrationHandler,
  faceIsAvailable
} = require("../modules/facial");

const {
  punchHandler
} = require("../modules/attendance");

const {
  adaptRequest,
  sendResponse
} = require('../util/http');

const router = express.Router();


// Define proper Multer diskStorage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const userId = req.params.userId || 'unknown';
    cb(null, `${userId}_face${ext}`);
  }
});

//Create upload middleware using diskStorage
const upload = multer({ storage });

//Login route
router.all("/auth/login", async (req, res) => {
  const httpRequest = adaptRequest(req);
  const result = await loginHandler(httpRequest);
  return sendResponse(res, result);
});

// Attendance punch route
router.post("/attendance/punch", async (req, res) => {
  const httpRequest = adaptRequest(req);
  const result = await punchHandler(httpRequest);
  return sendResponse(res, result);
});

// Face registration
router.post("/face/register/:userId", upload.single('image'), async (req, res) => {
  const httpRequest = adaptRequest(req);
  const result = await faceRegistrationHandler(httpRequest);
  return sendResponse(res, result);
});

// Face match
router.post("/face/match/:userId", upload.single('image'), async (req, res) => {
  const httpRequest = adaptRequest(req);
  const result = await faceMatchHandler(httpRequest);
  return sendResponse(res, result);
});

// Check if face exists
router.get("/face/isAvailable/:userId", async (req, res) => {
  const httpRequest = adaptRequest(req);
  const result = await faceIsAvailable(httpRequest);
  return sendResponse(res, result);
});

module.exports = router;
