const express = require('express');
const {
  createYearController,
  getYearController,
  detailYearController,
  updateYearController,
  deleteYearController,
} = require('../controllers/year.controller');
const router = express.Router();
const baseURL = '/api/v1';
/**
 * year create & get
 */
router
  .route(`${baseURL}/years`)
  .post(createYearController)
  .get(getYearController);
/**
 *
 * year update, detail,delete
 */
router
  .route(`${baseURL}/years/:yearId`)
  .get(detailYearController)
  .put(updateYearController)
  .delete(deleteYearController);
exports.default = (app) => {
  app.use('/', router);
};
