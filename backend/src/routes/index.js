const express = require('express');
const { loginHandler } = require("../modules/auth");
const { facialHandler } = require("../modules/facial");
const { punchHandler } = require("../modules/attendance");
const { adaptRequest, sendResponse } = require('../util/http');

const router = express.Router();

// Login route
router.all("/auth/login", async (req, res) => {
  const httpRequest = adaptRequest(req);
  const result = await loginHandler(httpRequest);
  return sendResponse(res, result);
});

// Facial descriptor check route
// router.get("/facial/check/:userId", async (req, res) => {
//   const httpRequest = adaptRequest(req);
//   const result = await facialHandler(httpRequest);
//   return sendResponse(res, result);
// });

//mock
router.get("/facial/check/:userId", async (req, res) => {
  // Skip real handler for now
  return res.status(200).json({
    exists: true, // or true if you want to simulate descriptor exists
    message: 'Mocked facial check response'
  });
});

// Attendance punch route
router.post("/attendance/punch", async (req, res) => {
  const httpRequest = adaptRequest(req);
  const result = await punchHandler(httpRequest);
  return sendResponse(res, result);
});


module.exports = router;


module.exports = router;