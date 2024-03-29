const express = require('express');

var multer = require('multer');
const fs = require('fs');
var mkdirp = require('mkdirp');
const path = require('path');
const {
  createUserController,
  getUserController,
  loginController,
  createTrainerController,
  getUserHomeController,
  createAdminController,
  updateAdminController,
  detailAdminController,
  deleteUserController,
  getBookingHistroyController,
  saveFirebaseTokenController,
  getNotificationController,
  updateTrainerLocationController,
  getTrainerLocationController,
  addNewAddressController,
  changePasswordController,
  updateAddressController,
  getBookingDateController,
} = require('../controllers/user.controller');
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
    req.uploadfilename = fileName;
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
router.route(`${baseURL}/users`).get(getUserController);
router.route(`${baseURL}/users/change-password`).post(changePasswordController);

/**
 * user login
 */
router.route(`${baseURL}/users/login`).post(loginController);
/**
 * Members
 */
router
  .route(`${baseURL}/users/members`)
  .post(profileUpload, createUserController);
router.route(`${baseURL}/users/members/home`).get(getUserHomeController);

/**
 *
 * Trainer
 */
router
  .route(`${baseURL}/users/trainer`)
  .post(profileUpload, createTrainerController);
/**
 * admin
 */
router
  .route(`${baseURL}/users/admin`)
  .post(profileUpload, createAdminController);
router
  .route(`${baseURL}/users/admin/:adminId`)
  .put(profileUpload, updateAdminController);

router
  .route(`${baseURL}/users/:userId`)
  .get(detailAdminController)
  .delete(deleteUserController);

router
  .route(`${baseURL}/users/bookings/history`)
  .get(getBookingHistroyController);

router.route(`${baseURL}/users/bookings/date`).get(getBookingDateController);

router
  .route(`${baseURL}/users/register/firebase`)
  .post(saveFirebaseTokenController);
router
  .route(`${baseURL}/users/update/location`)
  .post(updateTrainerLocationController);

router.route(`${baseURL}/notifications`).get(getNotificationController);
router
  .route(`${baseURL}/booking/location/:trainerId`)
  .get(getTrainerLocationController);
router.route(`${baseURL}/add/new_address`).post(addNewAddressController);
router.route(`${baseURL}/update/update_address`).put(updateAddressController);

exports.default = (app) => {
  app.use('/', router);
};
