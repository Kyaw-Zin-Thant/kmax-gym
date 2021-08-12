const Fee = require('../models/fee.model');

const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
exports.creatFeeService = async ({
  name,
  amount,
  currency,
  noOfUser,
  noOfDay,
  description,
}) => {
  try {
    await new Fee({
      name,
      amount,
      currency,
      noOfUser,
      description,
      noOfDay,
    }).save();
    return { message: 'Succesfully Created' };
  } catch (error) {
    throw error;
  }
};
exports.updateFeeService = async ({
  name,
  amount,
  currency,
  noOfUser,
  noOfDay,
  description,
  feeId,
}) => {
  try {
    await Fee.updateOne(
      { _id: ObjectId(feeId) },
      {
        name,
        amount,
        currency,
        noOfUser,
        description,
        noOfDay,
      }
    );
    return { message: 'Succesfully Updated' };
  } catch (error) {
    throw error;
  }
};
exports.deleteFeeService = async ({ feeId }) => {
  try {
    await Fee.deleteOne({ _id: ObjectId(feeId) });
    return { message: 'Succesfully Deleted' };
  } catch (error) {
    throw error;
  }
};
exports.detailFeeService = async ({ feeId }) => {
  try {
    const fee = await Fee.findOne(
      { _id: ObjectId(feeId) },
      {
        _id: 0,
        feeId: '$_id',
        amount: 1,
        currency: { $cond: ['$currency', '$currency', 'MMK'] },
        description: 1,
        name: 1,
        noOfUser: 1,
        noOfDay: 1,
      }
    );
    return fee;
  } catch (error) {
    throw error;
  }
};

exports.getFeeService = async ({
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
              name: {
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
              noOfUser: {
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
    if (sortColumn === 'noOfUser') {
      sortQuery = {
        $sort: {
          noOfUser: sortDirection,
        },
      };
    } else if (sortColumn === 'name') {
      sortQuery = {
        $sort: {
          name: sortDirection,
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
    }
    const skip = parseInt(page, 10) - 1;
    limit = parseInt(limit, 10);
    let result = await Fee.aggregate([
      searchQuery,
      sortQuery,
      {
        $project: {
          _id: 0,
          feeId: '$_id',
          amount: 1,
          currency: { $cond: ['$currency', '$currency', 'MMK'] },
          description: 1,
          name: 1,
          noOfUser: 1,
          createdDate: 1,
          updatedDate: 1,
        },
      },
      {
        $facet: {
          fees: [{ $skip: skip }, { $limit: limit }],
          totalCount: [
            {
              $count: 'count',
            },
          ],
        },
      },
    ]);
    let response = {};
    const { fees, totalCount } = result[0];
    response.fees = fees || [];
    response.totalCount = totalCount[0] ? totalCount[0].count : 0;
    response.sortColumn = sortColumn;
    response.sortDirection = sortDirection === -1 ? 'desc' : 'asc';
    return response;
  } catch (error) {
    throw error;
  }
};
