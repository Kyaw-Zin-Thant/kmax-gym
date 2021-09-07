const Promotion = require('../models/promotion.model');

const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
exports.creatPromotionService = async ({
  name,
  startDate,
  endDate,
  bannerImage,
}) => {
  try {
    await new Promotion({
      name,
      startDate,
      endDate,
      bannerImage,
    }).save();
    return { message: 'Succesfully Created' };
  } catch (error) {
    throw error;
  }
};
exports.updatePromotionService = async ({
  name,
  startDate,
  endDate,
  promotionId,
  bannerImage,
}) => {
  try {
    const updateData = bannerImage
      ? {
          name,
          startDate,
          endDate,
          bannerImage,
        }
      : {
          name,
          startDate,
          endDate,
        };
    await Promotion.updateOne({ _id: ObjectId(promotionId) }, updateData);
    return { message: 'Succesfully Updated' };
  } catch (error) {
    throw error;
  }
};
exports.deletePromotionService = async ({ promotionId }) => {
  try {
    await Promotion.deleteOne({ _id: ObjectId(promotionId) });
    return { message: 'Succesfully Deleted' };
  } catch (error) {
    throw error;
  }
};
exports.detailPromotionService = async ({ promotionId }) => {
  try {
    const promotion = await Promotion.findOne(
      { _id: ObjectId(promotionId) },
      {
        _id: 0,
        promotionId: '$_id',
        name: 1,
        startDate: 1,
        endDate: 1,
        bannerImage: 1,
      }
    );
    return promotion;
  } catch (error) {
    throw error;
  }
};

exports.getPromotionService = async ({
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
    if (sortColumn === 'bannerImage') {
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
    } else if (sortColumn === 'startDate') {
      sortQuery = {
        $sort: {
          createdDate: sortDirection,
        },
      };
    } else if (sortColumn === 'endDate') {
      sortQuery = {
        $sort: {
          updatedDate: sortDirection,
        },
      };
    }
    const skip = parseInt(page, 10) - 1;
    limit = parseInt(limit, 10);
    let result = await Promotion.aggregate([
      searchQuery,
      sortQuery,
      {
        $project: {
          _id: 0,
          promotionId: '$_id',
          name: 1,
          startDate: 1,
          endDate: 1,
          bannerImage: 1,
        },
      },
      {
        $facet: {
          promotions: [{ $skip: skip }, { $limit: limit }],
          totalCount: [
            {
              $count: 'count',
            },
          ],
        },
      },
    ]);
    let response = {};
    const { promotions, totalCount } = result[0];
    response.promotions = promotions || [];
    response.totalCount = totalCount[0] ? totalCount[0].count : 0;
    response.sortColumn = sortColumn;
    response.sortDirection = sortDirection === -1 ? 'desc' : 'asc';
    return response;
  } catch (error) {
    throw error;
  }
};
