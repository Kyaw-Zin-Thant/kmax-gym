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
  .route(`${baseURL}/users/trainers`)
  .post(profileUpload, createTrainerController);
/**
 * admin
 */
router
  .route(`${baseURL}/users/admin`)
  .post(profileUpload, createAdminController);
router
  .route(`${baseURL}/users/admin/:adminId`)
  .get(detailAdminController)
  .put(profileUpload, updateAdminController);

router.route(`${baseURL}/users/:userId`).delete(deleteUserController);

exports.default = (app) => {
  app.use('/', router);
};
