const express = require('express');
const { loginHandler } = require("../modules/auth");
const { adaptRequest, sendResponse } = require('../util/http');

const router = express.Router();
console.log("loginHandler type:", typeof loginHandler); // should print "function"

router.all("/auth/login", async (req, res, next) => {
  const httpRequest = adaptRequest(req);
  const result = await loginHandler(httpRequest);
  // console.log(result, 'res');
  return sendResponse(res, result);
});


module.exports = router;