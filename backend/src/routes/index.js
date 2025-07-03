const express = require('express');
const { loginHandler } = require("../modules/auth");
const { faceMatchHandler, faceRegistrationHandler, faceIsAvailable} = require("../modules/facial");
const { punchHandler } = require("../modules/attendance");
const { adaptRequest, sendResponse } = require('../util/http');
const multer = require('multer');
const path = require('path');
// const { exec } = require('child_process');
// const fs = require('fs');

const router = express.Router();

// Multer config
// const upload = multer({ dest: '../../public/uploads/' });
// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.userId}_face${ext}`);
  },
});

const upload = multer({ storage });

// Login route
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

//face register route
router.post("/face/register/:userId", upload.single('image'), async (req, res) => {
  const httpRequest = adaptRequest(req);
  const result = await faceRegistrationHandler(httpRequest);
  return sendResponse(res, result);
})

//face match route
router.post("/face/match/:userId", upload.single('image'), async (req, res) => {
  const httpRequest = adaptRequest(req);
  const result = await faceMatchHandler(httpRequest);
  return sendResponse(res, result);
});

//face data isAvailable
router.get("/face/isAvailable/:userId", async (req, res) => {
  const httpRequest = adaptRequest(req);
  const result = await faceIsAvailable(httpRequest);
  return sendResponse(res, result);
})

module.exports = router;

