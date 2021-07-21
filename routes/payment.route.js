const express = require('express');

const {
  getPaymentController,
  createPaymentController,
  updatePaymentController,
  deletePaymentController,
  getAccountController,
  createAccountController,
  updateAccountController,
  deleteAccountController,
} = require('../controllers/payment.controller');
const router = express.Router();
const baseURL = '/api/v1';

router
  .route(`${baseURL}/accounts`)
  .get(getAccountController)
  .post(createAccountController);
router
  .route(`${baseURL}/accounts/:accountId`)
  .put(updateAccountController)
  .delete(deleteAccountController);
/**
 *
 * Create Payment Get
 */
router
  .route(`${baseURL}/payments`)
  .get(getPaymentController)
  .post(createPaymentController);
/**
 * update delete
 */
router
  .route(`${baseURL}/payments/:paymentId`)
  .put(updatePaymentController)
  .delete(deletePaymentController);

exports.default = (app) => {
  app.use('/', router);
};
