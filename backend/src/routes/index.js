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
  punchHandler, getAttendanceHandler
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

//get attendance
router.get("/attendance/get", async (req, res) => {
  const httpRequest = adaptRequest(req);
  const result = await getAttendanceHandler(httpRequest);
  return sendResponse(res, result);
})

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
// const express = require('express');
// const path = require('path');
// const multer = require('multer');
//
// const {
//     loginHandler
// } = require("../modules/auth");
//
// const {
//     faceMatchHandler,
//     faceRegistrationHandler,
//     faceIsAvailable
// } = require("../modules/facial");
//
// const {
//     punchHandler, getAttendanceHandler
// } = require("../modules/attendance");
//
// const {
//     adaptRequest,
//     sendResponse
// } = require('../util/http');
//
// const router = express.Router();
//
// // Add timing middleware
// router.use((req, res, next) => {
//     req.startTime = Date.now();
//     const originalEnd = res.end;
//
//     res.end = function (...args) {
//         const duration = Date.now() - req.startTime;
//         console.log(`EXPRESS: ${req.method} ${req.path} completed in ${duration}ms`);
//         originalEnd.apply(res, args);
//     };
//
//     console.log(`EXPRESS: ${req.method} ${req.path} started at ${new Date().toISOString()}`);
//     next();
// });
//
// // Define proper Multer diskStorage with timing
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         const destStartTime = Date.now();
//         console.log('EXPRESS: Setting upload destination...');
//
//         cb(null, path.join(__dirname, '../../public/uploads'));
//
//         const destEndTime = Date.now();
//         console.log(`EXPRESS: Upload destination set in ${destEndTime - destStartTime}ms`);
//     },
//     filename: function (req, file, cb) {
//         const nameStartTime = Date.now();
//         console.log('EXPRESS: Generating filename...');
//
//         const ext = path.extname(file.originalname);
//         const userId = req.params.userId || 'unknown';
//         const filename = `${userId}_face${ext}`;
//
//         console.log(`EXPRESS: Generated filename: ${filename}`);
//         cb(null, filename);
//
//         const nameEndTime = Date.now();
//         console.log(`EXPRESS: Filename generation took ${nameEndTime - nameStartTime}ms`);
//     }
// });
//
// // Create upload middleware with timing
// const upload = multer({
//     storage,
//     limits: {
//         fileSize: 10 * 1024 * 1024 // 10MB limit
//     }
// });
//
// // Add multer timing middleware
// const timedUpload = (req, res, next) => {
//     const uploadStartTime = Date.now();
//     console.log('EXPRESS: Starting file upload processing...');
//
//     upload.single('image')(req, res, (err) => {
//         const uploadEndTime = Date.now();
//
//         if (err) {
//             console.log(`EXPRESS: File upload failed after ${uploadEndTime - uploadStartTime}ms`);
//             console.log(`EXPRESS: Upload error:`, err.message);
//             return res.status(400).json({
//                 success: false,
//                 message: 'File upload failed',
//                 error: err.message
//             });
//         }
//
//         console.log(`EXPRESS: File upload completed in ${uploadEndTime - uploadStartTime}ms`);
//         if (req.file) {
//             console.log(`EXPRESS: File details - Size: ${req.file.size} bytes, Path: ${req.file.path}`);
//         }
//
//         next();
//     });
// };
//
// // Login route with timing
// router.all("/auth/login", async (req, res) => {
//     const routeStartTime = Date.now();
//     console.log('EXPRESS: Processing login request...');
//
//     try {
//         const adaptedRequest = adaptRequest(req);
//         const adaptTime = Date.now();
//         console.log(`EXPRESS: Request adapted in ${adaptTime - routeStartTime}ms`);
//
//         const result = await loginHandler(adaptedRequest);
//         const handlerTime = Date.now();
//         console.log(`EXPRESS: Login handler completed in ${handlerTime - adaptTime}ms`);
//
//         sendResponse(res, result);
//         const responseTime = Date.now();
//         console.log(`EXPRESS: Response sent in ${responseTime - handlerTime}ms`);
//         console.log(`EXPRESS: Total login processing time: ${responseTime - routeStartTime}ms`);
//
//     } catch (error) {
//         const errorTime = Date.now();
//         console.log(`EXPRESS: Login error after ${errorTime - routeStartTime}ms:`, error.message);
//
//         res.status(500).json({
//             success: false,
//             message: 'Login failed',
//             error: error.message
//         });
//     }
// });
//
// // Attendance punch route with timing
// router.post("/attendance/punch", async (req, res) => {
//     const routeStartTime = Date.now();
//     console.log('EXPRESS: Processing attendance punch...');
//
//     try {
//         const adaptedRequest = adaptRequest(req);
//         const adaptTime = Date.now();
//         console.log(`EXPRESS: Request adapted in ${adaptTime - routeStartTime}ms`);
//
//         const result = await punchHandler(adaptedRequest);
//         const handlerTime = Date.now();
//         console.log(`EXPRESS: Punch handler completed in ${handlerTime - adaptTime}ms`);
//
//         sendResponse(res, result);
//         const responseTime = Date.now();
//         console.log(`EXPRESS: Response sent in ${responseTime - handlerTime}ms`);
//         console.log(`EXPRESS: Total attendance punch time: ${responseTime - routeStartTime}ms`);
//
//     } catch (error) {
//         const errorTime = Date.now();
//         console.log(`EXPRESS: Attendance punch error after ${errorTime - routeStartTime}ms:`, error.message);
//
//         res.status(500).json({
//             success: false,
//             message: 'Attendance punch failed',
//             error: error.message
//         });
//     }
// });
//
// // Get attendance route with timing
// router.get("/attendance/get", async (req, res) => {
//     const routeStartTime = Date.now();
//     console.log('EXPRESS: Getting attendance data...');
//
//     try {
//         const adaptedRequest = adaptRequest(req);
//         const adaptTime = Date.now();
//         console.log(`EXPRESS: Request adapted in ${adaptTime - routeStartTime}ms`);
//
//         const result = await getAttendanceHandler(adaptedRequest);
//         const handlerTime = Date.now();
//         console.log(`EXPRESS: Get attendance handler completed in ${handlerTime - adaptTime}ms`);
//
//         sendResponse(res, result);
//         const responseTime = Date.now();
//         console.log(`EXPRESS: Response sent in ${responseTime - handlerTime}ms`);
//         console.log(`EXPRESS: Total get attendance time: ${responseTime - routeStartTime}ms`);
//
//     } catch (error) {
//         const errorTime = Date.now();
//         console.log(`EXPRESS: Get attendance error after ${errorTime - routeStartTime}ms:`, error.message);
//
//         res.status(500).json({
//             success: false,
//             message: 'Get attendance failed',
//             error: error.message
//         });
//     }
// });
//
// // Face registration with timing
// router.post("/face/register/:userId", timedUpload, async (req, res) => {
//     const routeStartTime = Date.now();
//     console.log(`EXPRESS: Processing face registration for user ${req.params.userId}...`);
//
//     try {
//         if (!req.file) {
//             console.log(`EXPRESS: No file uploaded for face registration`);
//             return res.status(400).json({
//                 success: false,
//                 message: 'No image file provided'
//             });
//         }
//
//         const adaptedRequest = adaptRequest(req);
//         const adaptTime = Date.now();
//         console.log(`EXPRESS: Request adapted in ${adaptTime - routeStartTime}ms`);
//
//         const result = await faceRegistrationHandler(adaptedRequest);
//         const handlerTime = Date.now();
//         console.log(`EXPRESS: Face registration handler completed in ${handlerTime - adaptTime}ms`);
//
//         sendResponse(res, result);
//         const responseTime = Date.now();
//         console.log(`EXPRESS: Response sent in ${responseTime - handlerTime}ms`);
//         console.log(`EXPRESS: Total face registration time: ${responseTime - routeStartTime}ms`);
//
//     } catch (error) {
//         const errorTime = Date.now();
//         console.log(`EXPRESS: Face registration error after ${errorTime - routeStartTime}ms:`, error.message);
//
//         res.status(500).json({
//             success: false,
//             message: 'Face registration failed',
//             error: error.message
//         });
//     }
// });
//
// // Face match with timing
// router.post("/face/match/:userId", timedUpload, async (req, res) => {
//     const routeStartTime = Date.now();
//     console.log(`EXPRESS: Processing face match for user ${req.params.userId}...`);
//
//     try {
//         if (!req.file) {
//             console.log(`EXPRESS: No file uploaded for face matching`);
//             return res.status(400).json({
//                 success: false,
//                 message: 'No image file provided'
//             });
//         }
//
//         const adaptedRequest = adaptRequest(req);
//         const adaptTime = Date.now();
//         console.log(`EXPRESS: Request adapted in ${adaptTime - routeStartTime}ms`);
//
//         const result = await faceMatchHandler(adaptedRequest);
//         const handlerTime = Date.now();
//         console.log(`EXPRESS: Face match handler completed in ${handlerTime - adaptTime}ms`);
//
//         sendResponse(res, result);
//         const responseTime = Date.now();
//         console.log(`EXPRESS: Response sent in ${responseTime - handlerTime}ms`);
//         console.log(`EXPRESS: Total face match time: ${responseTime - routeStartTime}ms`);
//
//     } catch (error) {
//         const errorTime = Date.now();
//         console.log(`EXPRESS: Face match error after ${errorTime - routeStartTime}ms:`, error.message);
//
//         res.status(500).json({
//             success: false,
//             message: 'Face matching failed',
//             error: error.message
//         });
//     }
// });
//
// // Check if face exists with timing
// router.get("/face/isAvailable/:userId", async (req, res) => {
//     const routeStartTime = Date.now();
//     console.log(`EXPRESS: Checking face availability for user ${req.params.userId}...`);
//
//     try {
//         const adaptedRequest = adaptRequest(req);
//         const adaptTime = Date.now();
//         console.log(`EXPRESS: Request adapted in ${adaptTime - routeStartTime}ms`);
//
//         const result = await faceIsAvailable(adaptedRequest);
//         const handlerTime = Date.now();
//         console.log(`EXPRESS: Face availability check completed in ${handlerTime - adaptTime}ms`);
//
//         sendResponse(res, result);
//         const responseTime = Date.now();
//         console.log(`EXPRESS: Response sent in ${responseTime - handlerTime}ms`);
//         console.log(`EXPRESS: Total face availability check time: ${responseTime - routeStartTime}ms`);
//
//     } catch (error) {
//         const errorTime = Date.now();
//         console.log(`EXPRESS: Face availability check error after ${errorTime - routeStartTime}ms:`, error.message);
//
//         res.status(500).json({
//             success: false,
//             message: 'Face availability check failed',
//             error: error.message
//         });
//     }
// });
//
// module.exports = router;
