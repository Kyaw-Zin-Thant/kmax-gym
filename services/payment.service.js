const Payment = require('../models/payment.model');
const Account = require('../models/account.model');
const Fee = require('../models/fee.model');
const User = require('../models/user.model');

const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
exports.creatPaymentService = async ({
  accountId,
  amount,
  description,
  paytype,
  status,
  payAccount,
  payAccountType,
  userId,
  currency = 'MMK',
  payUserId,
  feeId = '',
}) => {
  try {
    const account = await Account.findById(accountId);
    let fee, noOfDay;
    if (feeId) {
      fee = await Fee.findById(feeId);
      noOfDay = fee.noOfDay * (amount / fee.amount);
    }
    const accountAmount =
      paytype == 'Income' ? account.amount + amount : account.amount - amount;
    feeId
      ? await Promise.all([
          new Payment({
            accountId,
            amount,
            description,
            paytype,
            status,
            payAccount,
            payAccountType,
            createdUser: userId,
            currency,
            payUserId,
          }).save(),
          Account.findByIdAndUpdate(accountId, {
            $set: { amount: accountAmount },
          }),
          User.findByIdAndUpdate(userId, {
            $set: {
              metadata: { noOfDays, status: 'Pending' },
            },
          }),
        ])
      : await Promise.all([
          new Payment({
            accountId,
            amount,
            description,
            paytype,
            status,
            payAccount,
            payAccountType,
            createdUser: userId,
            currency,
            payUserId,
          }).save(),
          Account.findByIdAndUpdate(accountId, {
            $set: { amount: accountAmount },
          }),
        ]);
    return { message: 'Succesfully Created' };
  } catch (error) {
    throw error;
  }
};
exports.updatePaymentService = async ({
  accountId,
  amount,
  description,
  paytype,
  status,
  payAccount,
  payAccountType,
  userId,
  paymentId,
  currency = 'MMK',
  payUserId,
}) => {
  try {
    const account = await Account.findById(accountId);
    const accountAmount =
      paytype == 'Income' ? account.amount + amount : account.amount - amount;
    await Promise.all([
      Payment.updateOne(
        { _id: ObjectId(paymentId) },
        {
          accountId,
          amount,
          description,
          paytype,
          status,
          payAccount,
          payAccountType,
          createdUser: userId,
          currency,
          payUserId,
        }
      ),
      Account.findByIdAndUpdate(accountId, { $set: { amount: accountAmount } }),
    ]);
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
          'account.accNo': sortDirection,
        },
      };
    } else if (sortColumn === 'accountType') {
      sortQuery = {
        $sort: {
          'account.accountType': sortDirection,
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
      {
        $lookup: {
          from: 'accounts',
          let: { accountId: '$accountId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$accountId'],
                },
              },
            },
            {
              $project: {
                _id: 0,
                accountId: '$_id',
                name: 1,
                accNo: 1,
                accountType: 1,
              },
            },
          ],
          as: 'account',
        },
      },
      {
        $unwind: {
          path: '$account',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { payUserId: '$payUserId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$payUserId'],
                },
              },
            },
            {
              $project: {
                _id: 0,
                userId: '$_id',
                username: 1,
                email: 1,
              },
            },
          ],
          as: 'payUser',
        },
      },
      {
        $unwind: {
          path: '$payUser',
          preserveNullAndEmptyArrays: true,
        },
      },
      searchQuery,
      sortQuery,
      {
        $project: {
          _id: 0,
          paymentId: '$_id',
          accountNo: '$account.accNo',
          accountType: '$account.accountType',
          accountId: '$account._id',
          account: 1,
          payUser: 1,
          amount: 1,
          currency: { $cond: ['$currency', '$currency', 'MMK'] },
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
exports.getAccountService = async ({
  search,
  page,
  limit,
  sortColumn,
  sortDirection,
  fee,
}) => {
  try {
    let searchQuery = {
      $match: {},
    };
    let feeQuery = { $match: {} };
    fee ? (feeQuery = { $match: { fee: fee == 'True' } }) : '';
    if (search) {
      searchQuery = {
        $match: {
          $or: [
            {
              accNo: {
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
              currency: {
                $regex: search,
                $options: 'i',
              },
            },
            {
              fee: {
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
    if (sortColumn === 'createdDate') {
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
    } else if (sortColumn === 'accNO') {
      sortQuery = {
        $sort: {
          accNO: sortDirection,
        },
      };
    } else if (sortColumn === 'name') {
      sortQuery = {
        $sort: {
          name: sortDirection,
        },
      };
    } else if (sortColumn === 'fee') {
      sortQuery = {
        $sort: {
          fee: sortDirection,
        },
      };
    } else if (sortColumn === 'currency') {
      sortQuery = {
        $sort: {
          currency: sortDirection,
        },
      };
    } else if (sortColumn === 'amount') {
      sortQuery = {
        $sort: {
          amount: sortDirection,
        },
      };
    } else if (sortColumn === 'accountType') {
      sortQuery = {
        $sort: {
          accountType: sortDirection,
        },
      };
    }
    const skip = parseInt(page, 10) - 1;
    limit = parseInt(limit, 10);
    let result = await Account.aggregate([
      searchQuery,
      feeQuery,
      sortQuery,
      {
        $project: {
          _id: 0,
          accountId: '$_id',
          name: 1,
          accNO: { $cond: ['$accNo', '$accNo', ''] },
          accountType: 1,
          amount: 1,
          currency: 1,
          fee: 1,
        },
      },
      {
        $facet: {
          accounts: [{ $skip: skip }, { $limit: limit }],
          totalCount: [
            {
              $count: 'count',
            },
          ],
        },
      },
    ]);
    let response = {};
    const { accounts, totalCount } = result[0];
    response.accounts = accounts || [];
    response.totalCount = totalCount[0] ? totalCount[0].count : 0;
    response.sortColumn = sortColumn;
    response.sortDirection = sortDirection === -1 ? 'desc' : 'asc';
    return response;
  } catch (error) {
    throw error;
  }
};
exports.createAccountService = async ({
  name,
  accNo,
  amount,
  currency,
  fee,
  accountType,
}) => {
  try {
    const account = new Account({
      name,
      accNo,
      amount,
      currency,
      fee,
      accountType,
    });
    await account.save();
    return { message: 'Successfully created' };
  } catch (error) {
    throw error;
  }
};

exports.updateAccountService = async ({
  name,
  accNo,
  amount,
  currency,
  fee,
  accountType,
  accountId,
}) => {
  try {
    await Account.findByIdAndUpdate(accountId, {
      $set: { name, accNo, amount, currency, fee, accountType },
    });
    return { message: 'Successfully updated' };
  } catch (error) {
    throw error;
  }
};
exports.deleteAccountService = async ({ accountId }) => {
  try {
    await Account.findByIdAndRemove(accountId);
    return { message: 'Successfully deleted' };
  } catch (error) {
    throw error;
  }
};
