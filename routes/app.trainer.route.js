const express = require('express');

var multer = require('multer');
const fs = require('fs');
var mkdirp = require('mkdirp');
const path = require('path');
const {
  getTrainerDetailController,
  updateTrainerController,
  getTrainerBookingController,
  bookingStatusUpdateController,
  updateTrainerProfileController,
  getDietPlanController,
  suggestMemberController,
  updateTrainerEduAndExpController,
} = require('../controllers/app.trainer.controller');
const router = express.Router();
const baseURL = '/api/v1';
// profile image upload
var profileImgStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    var uploadpath = path.join(__dirname, '../public/uploads/profileImage');
    req.uploadpath = uploadpath;
    fs.stat(uploadpath, function (err, stat) {
      if (stat) {
        callback(null, uploadpath);
      } else {
        mkdirp(uploadpath).then((made) => {
          if (!made) {
            callback(null, uploadpath);
          }
        });
      }
    });
  },

  filename: function (req, file, cb) {
    var extFile = file.originalname.split('.').pop();
    var randomNumber = getRandomString();
    var fileName = randomNumber + '.' + extFile;
    req.file = file;
    req.file.uploadfilename = fileName;
    cb(null, fileName); // modified here  or user file.mimetype
  },
});

var profileUpload = multer({
  storage: profileImgStorage,
  fileFilter: function (req, file, cb) {
    cb(null, true);
  },
}).any();

var getRandomString = function () {
  return Math.random().toString(36).substring(2) + Date.now();
};

/**
 *
 * Trainer detail
 */
router
  .route(`${baseURL}/users/trainer/:trainerId`)
  .get(getTrainerDetailController)
  .put(updateTrainerController);
/**
 *
 * Trainer Home
 */
router.route(`${baseURL}/users/trainers/home`).get(getTrainerBookingController);

router
  .route(`${baseURL}/bookings/:bookingId/:status`)
  .post(bookingStatusUpdateController);
router
  .route(`${baseURL}/users/trainer/:trainerId/profile`)
  .put(profileUpload, updateTrainerProfileController);
router.route(`${baseURL}/diet-plans`).get(getDietPlanController);

router
  .route(`${baseURL}/suggest-member/:bookingId`)
  .put(suggestMemberController);
router
  .route(`${baseURL}/users/trainers/update/edu-exp`)
  .put(updateTrainerEduAndExpController);

exports.default = (app) => {
  app.use('/', router);
};
