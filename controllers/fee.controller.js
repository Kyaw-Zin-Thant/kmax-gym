const {
  creatFeeService,
  updateFeeService,
  deleteFeeService,
  getFeeService,
  detailFeeService,
} = require('../services/fee.service');
/**
 * creatFeeController
 */
exports.createFeeController = async (req, res, next) => {
  try {
    const { name, amount, currency, noOfUser, description } = {
      ...req.body,
      ...req.headers,
    };
    const response = await creatFeeService({
      name,
      amount,
      currency,
      noOfUser,
      description,
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
exports.updateFeeController = async (req, res, next) => {
  try {
    const { name, amount, currency, noOfUser, description, feeId } = {
      ...req.body,
      ...req.headers,
      ...req.params,
    };
    const response = await updateFeeService({
      name,
      amount,
      currency,
      noOfUser,
      description,
      feeId,
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
exports.deleteFeeController = async (req, res, next) => {
  try {
    const { feeId } = req.params;
    const response = await deleteFeeService({ feeId });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
exports.detailFeeController = async (req, res, next) => {
  try {
    const { feeId } = req.params;
    const response = await detailFeeService({ feeId });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
exports.getFeeController = async (req, res, next) => {
  try {
    const {
      search,
      page = '1',
      limit = '10',
      sortColumn = 'createdDate',
      sortDirection = 'desc',
    } = req.query;
    let response = await getFeeService({
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
