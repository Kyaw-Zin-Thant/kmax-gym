const express = require('express');

const {
  getFeeController,
  createFeeController,
  updateFeeController,
  deleteFeeController,
  detailFeeController,
} = require('../controllers/fee.controller');
const router = express.Router();
const baseURL = '/api/v1';

/**
 *
 * Create Fee Get
 */
router.route(`${baseURL}/fees`).get(getFeeController).post(createFeeController);
/**
 * update delete
 */
router
  .route(`${baseURL}/fees/:feeId`)
  .get(detailFeeController)
  .put(updateFeeController)
  .delete(deleteFeeController);

exports.default = (app) => {
  app.use('/', router);
};
