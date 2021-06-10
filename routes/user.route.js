const express = require('express');

var multer = require('multer');
const fs = require('fs');
var mkdirp = require('mkdirp');
const path = require('path');
const {
  createUserController,
  getUserController,
  // updateUserController,
  // detailUserController,
  // deleteUserController,
  // createStudentController,
  loginController,
  createTrainerController,
  // getParentHomeController,
  // getAdminHomePaymentInfoController,
  // getTeacherAssementsController,
  // getTeacherAssementScoresController,
  // getTeacherTimelineController,
  // updateStudentController,
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
 * user create & get
 */
router
  .route(`${baseURL}/users/members`)
  .post(profileUpload, createUserController);
// .get(getUserController);
/**
 *
 * user detail delete update
 */
// router
//   .route(`${baseURL}/users/:userId`)
//   .put(profileUpload, updateUserController)
//   .get(detailUserController)
//   .delete(deleteUserController);
/**
 *
 * Trainer Create
 */
router
  .route(`${baseURL}/users/trainers`)
  //   .get()
  .post(profileUpload, createTrainerController);
// router
//   .route(`${baseURL}/students/:studentId`)
//   .put(profileUpload, updateStudentController);
/**
 *
 * Home
 */

exports.default = (app) => {
  app.use('/', router);
};
