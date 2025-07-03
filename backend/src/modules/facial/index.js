const FaceMatchService = require('./face.match.service');
const FaceRegistrationService = require('./face.registration.service');
const FaceIsAvailableService = require('./face.isAvailable.service');
const CustomError = require('../../util/error');

const faceMatchHandler = FaceMatchService({CustomError, env: process.env});
const faceRegistrationHandler = FaceRegistrationService({CustomError, env: process.env});
const faceIsAvailable = FaceIsAvailableService({CustomError, env: process.env});

module.exports = {faceMatchHandler, faceRegistrationHandler, faceIsAvailable};