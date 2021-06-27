const {
  creatPaymentService,
  updatePaymentService,
  deletePaymentService,
  getPaymentService,
} = require('../services/payment.service');
/**
 * creatPaymentController
 */
exports.createPaymentController = async (req, res, next) => {
  try {
    const {
      accountNo,
      accountType,
      amount,
      description,
      paytype,
      status,
      payAccount,
      payAccountType,
      userId,
    } = { ...req.body, ...req.headers };
    const response = await creatPaymentService({
      accountNo,
      accountType,
      amount,
      description,
      paytype,
      status,
      payAccount,
      payAccountType,
      userId,
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
exports.updatePaymentController = async (req, res, next) => {
  try {
    const {
      accountNo,
      accountType,
      amount,
      description,
      paytype,
      status,
      payAccount,
      payAccountType,
      userId,
      paymentId,
    } = { ...req.body, ...req.headers, ...req.params };
    const response = await updatePaymentService({
      accountNo,
      accountType,
      amount,
      description,
      paytype,
      status,
      payAccount,
      payAccountType,
      userId,
      paymentId,
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
