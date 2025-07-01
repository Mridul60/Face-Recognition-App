const express = require('express');
const { loginHandler } = require("../modules/auth");
const { facialHandler } = require("../modules/facial");
const { adaptRequest, sendResponse } = require('../util/http');

const router = express.Router();

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

module.exports = router;


module.exports = router;