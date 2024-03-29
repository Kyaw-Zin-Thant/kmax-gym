const express = require('express');
var multer = require('multer');
const fs = require('fs');
var mkdirp = require('mkdirp');
const path = require('path');
const {
  getPromotionController,
  createPromotionController,
  updatePromotionController,
  deletePromotionController,
  detailPromotionController,
} = require('../controllers/promotion.controller');
const router = express.Router();
const baseURL = '/api/v1';
// file
var profileImgStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    var uploadpath = path.join(__dirname, '../public/uploads/bannerImage');
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

var bannerImageUpload = multer({
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
 * Create Promotion Get
 */
router
  .route(`${baseURL}/promotions`)
  .get(getPromotionController)
  .post(bannerImageUpload, createPromotionController);
/**
 * update delete
 */
router
  .route(`${baseURL}/promotions/:promotionId`)
  .get(detailPromotionController)
  .put(bannerImageUpload, updatePromotionController)
  .delete(deletePromotionController);

exports.default = (app) => {
  app.use('/', router);
};
