const {
  creatPaymentService,
  updatePaymentService,
  deletePaymentService,
  getPaymentService,
  createAccountService,
  getAccountService,
  updateAccountService,
  deleteAccountService,
} = require('../services/payment.service');
/**
 * creatPaymentController
 */
exports.createPaymentController = async (req, res, next) => {
  try {
    const {
      accountId,
      amount,
      description,
      paytype,
      status = 'Pending',
      payAccount,
      payAccountType,
      userId,
      currency,
      payUserId,
      feeId,
    } = { ...req.body, ...req.headers };
    const response = await creatPaymentService({
      accountId,
      amount,
      description,
      paytype,
      status,
      payAccount,
      payAccountType,
      userId,
      currency,
      payUserId,
      feeId,
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
exports.updatePaymentController = async (req, res, next) => {
  try {
    const {
      accountId,
      amount,
      description,
      paytype,
      status,
      payAccount,
      payAccountType,
      userId,
      paymentId,
      currency,
      payUserId,
    } = { ...req.body, ...req.headers, ...req.params };
    const response = await updatePaymentService({
      accountId,
      amount,
      description,
      paytype,
      status,
      payAccount,
      payAccountType,
      userId,
      paymentId,
      currency,
      payUserId,
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
exports.deletePaymentController = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const response = await deletePaymentService({ paymentId });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
exports.getPaymentController = async (req, res, next) => {
  try {
    const {
      search,
      page = '1',
      limit = '10',
      sortColumn = 'createdDate',
      sortDirection = 'desc',
    } = req.query;
    let response = await getPaymentService({
      search,
      page,
      limit,
      sortColumn,
      sortDirection,
    });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
exports.getAccountController = async (req, res, next) => {
  try {
    const {
      search,
      page = '1',
      limit = '10',
      sortColumn = 'createdDate',
      sortDirection = 'desc',
      fee = '',
    } = req.query;
    let response = await getAccountService({
      search,
      page,
      limit,
      sortColumn,
      sortDirection,
      fee,
    });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
/**
 * creatPaymentController
 */
exports.createAccountController = async (req, res, next) => {
  try {
    const {
      name,
      accNo,
      amount,
      currency = 'MMK',
      fee,
      accountType,
    } = { ...req.body, ...req.headers };
    const response = await createAccountService({
      name,
      accNo,
      amount,
      currency,
      fee,
      accountType,
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
exports.updateAccountController = async (req, res, next) => {
  try {
    const {
      name,
      accNo,
      amount,
      currency = 'MMK',
      fee,
      accountType,
      accountId,
    } = { ...req.body, ...req.params };
    const response = await updateAccountService({
      name,
      accNo,
      amount,
      currency,
      fee,
      accountType,
      accountId,
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
exports.deleteAccountController = async (req, res, next) => {
  try {
    const { accountId } = { ...req.body, ...req.params };
    const response = await deleteAccountService({
      accountId,
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
