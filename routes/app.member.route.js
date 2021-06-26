const express = require('express');

var multer = require('multer');
const fs = require('fs');
var mkdirp = require('mkdirp');
const path = require('path');
const {
  updatMemberInfoController,
  updateMemberBodyInfo,
  memberDetailInfoController,
  bookingController,
} = require('../controllers/app.member.controller');
const router = express.Router();
const baseURL = '/api/v1';
// profile image upload
var profileImgStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    var uploadpath = path.join(__dirname, '../public/uploads/bodyInfo');
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
 * Members Information
 */
router
  .route(`${baseURL}/users/members/:memberId`)
  .put(updatMemberInfoController);
router
  .route(`${baseURL}/users/members/:memberId/body`)
  .put(profileUpload, updateMemberBodyInfo);
/**
 * Member Detail
 */
router.route(`${baseURL}/users/members/detail`).get(memberDetailInfoController);

/**
 *
 * Member booking
 */
router.route(`${baseURL}/users/members/booking`).post(bookingController);

exports.default = (app) => {
  app.use('/', router);
};
