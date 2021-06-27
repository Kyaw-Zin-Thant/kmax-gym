const Payment = require('../models/payment.model');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
exports.creatPaymentService = async ({
  accountNo,
  accountType,
  amount,
  description,
  paytype,
  status,
  payAccount,
  payAccountType,
  userId,
}) => {
  try {
    await new Payment({
      accountNo,
      accountType,
      amount,
      description,
      paytype,
      status,
      payAccount,
      payAccountType,
      createdUser: userId,
    }).save();
    return { message: 'Succesfully Created' };
  } catch (error) {
    throw error;
  }
};
exports.updatePaymentService = async ({
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
}) => {
  try {
    await Payment.updateOne(
      { _id: ObjectId(paymentId) },
      {
        accountNo,
        accountType,
        amount,
        description,
        paytype,
        status,
        payAccount,
        payAccountType,
        createdUser: userId,
      }
    );
    return { message: 'Succesfully Updated' };
  } catch (error) {
    throw error;
  }
};
exports.deletePaymentService = async ({ paymentId }) => {
  try {
    await Payment.deleteOne({ _id: ObjectId(paymentId) });
    return { message: 'Succesfully Deleted' };
  } catch (error) {
    throw error;
  }
};

exports.getPaymentService = async ({
  search,
  page,
  limit,
  sortColumn,
  sortDirection,
}) => {
  try {
    let searchQuery = {
      $match: {},
    };
    if (search) {
      searchQuery = {
        $match: {
          $or: [
            {
              accountNo: {
                $regex: search,
                $options: 'i',
              },
            },
            {
              accountType: {
                $regex: search,
                $options: 'i',
              },
            },
            {
              amount: {
                $regex: search,
                $options: 'i',
              },
            },
            {
              description: {
                $regex: search,
                $options: 'i',
              },
            },
            {
              paytype: {
                $regex: search,
                $options: 'i',
              },
            },
            {
              status: {
                $regex: search,
                $options: 'i',
              },
            },
            {
              payAccount: {
                $regex: search,
                $options: 'i',
              },
            },
            {
              payAccountType: {
                $regex: search,
                $options: 'i',
              },
            },
          ],
        },
      };
    }
    sortDirection = sortDirection === 'desc' ? -1 : 1;
    let sortQuery = {
      $sort: {
        createdDate: sortDirection,
      },
    };
    if (sortColumn === 'accountNo') {
      sortQuery = {
        $sort: {
          accountNo: sortDirection,
        },
      };
    } else if (sortColumn === 'accountType') {
      sortQuery = {
        $sort: {
          accountType: sortDirection,
        },
      };
    } else if (sortColumn === 'createdDate') {
      sortQuery = {
        $sort: {
          createdDate: sortDirection,
        },
      };
    } else if (sortColumn === 'updatedDate') {
      sortQuery = {
        $sort: {
          updatedDate: sortDirection,
        },
      };
    } else if (sortColumn === 'amount') {
      sortQuery = {
        $sort: {
          amount: sortDirection,
        },
      };
    } else if (sortColumn === 'description') {
      sortQuery = {
        $sort: {
          description: sortDirection,
        },
      };
    } else if (sortColumn === 'paytype') {
      sortQuery = {
        $sort: {
          paytype: sortDirection,
        },
      };
    } else if (sortColumn === 'status') {
      sortQuery = {
        $sort: {
          status: sortDirection,
        },
      };
    } else if (sortColumn === 'payAccount') {
      sortQuery = {
        $sort: {
          payAccount: sortDirection,
        },
      };
    } else if (sortColumn === 'payAccountType') {
      sortQuery = {
        $sort: {
          payAccountType: sortDirection,
        },
      };
    }
    const skip = parseInt(page, 10) - 1;
    limit = parseInt(limit, 10);
    let result = await Payment.aggregate([
      searchQuery,
      sortQuery,
      {
        $project: {
          _id: 0,
          paymentId: '$_id',
          accountNo: 1,
          accountType: 1,
          amount: 1,
          description: 1,
          paytype: 1,
          status: 1,
          payAccount: 1,
          payAccountType: 1,
          createdDate: 1,
          updatedDate: 1,
        },
      },
      {
        $facet: {
          payments: [{ $skip: skip }, { $limit: limit }],
          totalCount: [
            {
              $count: 'count',
            },
          ],
        },
      },
    ]);
    let response = {};
    const { payments, totalCount } = result[0];
    response.payments = payments || [];
    response.totalCount = totalCount[0] ? totalCount[0].count : 0;
    response.sortColumn = sortColumn;
    response.sortDirection = sortDirection === -1 ? 'desc' : 'asc';
    return response;
  } catch (error) {
    throw error;
  }
};
