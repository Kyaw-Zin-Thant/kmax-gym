const User = require('../models/user.model');
const UserBookedTrainer = require('../models/user.trainers.model');
const UserBooking = require('../models/user.booking.trainer.model');
const mongoose = require('mongoose');
const moment = require('moment');
const { ObjectId } = mongoose.Types;
const bcrypt = require('bcrypt');
const fs = require('fs');
const TimeAgo = require('javascript-time-ago');
const en = require('javascript-time-ago/locale/en');

TimeAgo.addDefaultLocale(en);
const privateKey = fs.readFileSync('config/jwtRS256.key', 'utf8');
const publicKey = fs.readFileSync('config/jwtRS256.key.pub', 'utf8');
const jwt = require('jsonwebtoken');
const Base64 = require('../config/base64');
const crypto = require('crypto');
const Notification = require('../models/notification.model');
const Payment = require('../models/payment.model');
exports.createUserService = async ({ email, password, userType }) => {
  try {
    password = Base64.decode(password);
    console.log(password);
    password = await updateHash(password);
    const user = await new User({ email, password, userType }).save();
    const token = jwt.sign(
      {
        userId: user._id,
        userType,
      },
      privateKey,
      {
        algorithm: 'RS256',
      }
    );
    return { message: 'Successfully created', userId: user._id, token };
  } catch (error) {
    throw error;
  }
};
exports.createTrainerService = async ({
  email,
  password,
  userType,
  gender,
  username,
  techanics,
  dateOfBirth,
  height,
  weight,
  description,
}) => {
  try {
    password = Base64.decode(password);
    password = await updateHash(password);
    const trainerCode = crypto.randomBytes(9).toString('hex');
    const user = new User({
      email,
      password,
      userType,
      gender,
      username,
      techanics,
      dateOfBirth,
      height,
      weight,
      description,
      trainerCode,
    }).save();
    return { message: 'Successfully created', userId: user._id };
  } catch (error) {
    throw error;
  }
};
exports.updateTrainerService = async ({
  trainerId,
  email,
  userType,
  gender,
  username,
  techanics,
  dateOfBirth,
  height,
  weight,
  description,
}) => {
  try {
    const user = await User.findByIdAndUpdate(trainerId, {
      email,
      userType,
      gender,
      username,
      techanics,
      dateOfBirth,
      height,
      weight,
      description,
    });
    return { message: 'Successfully updated', userId: user._id };
  } catch (error) {
    throw error;
  }
};
exports.createAdminService = async ({
  email,
  password,
  userType,
  gender,
  username,
  dateOfBirth,
  address,
  image,
}) => {
  try {
    password = Base64.decode(password);
    password = await updateHash(password);
    const user = new User({
      email,
      password,
      userType,
      gender,
      username,
      dateOfBirth,
      address,
      image,
    }).save();
    return { message: 'Successfully created', userId: user._id };
  } catch (error) {
    throw error;
  }
};
exports.updateAdminService = async ({
  email,
  password,
  userType,
  gender,
  username,
  dateOfBirth,
  address,
  image,
  adminId,
}) => {
  try {
    let updateData = {
      email,
      userType,
      gender,
      username,
      dateOfBirth,
      address,
    };

    if (password) {
      password = Base64.decode(password);
      password = await updateHash(password);
      updateData.password = password;
    }
    if (image) {
      updateData.image = image;
    }

    const user = await User.findByIdAndUpdate(adminId, updateData);
    return { message: 'Successfully updated', userId: user._id };
  } catch (error) {
    throw error;
  }
};
exports.getUserService = async ({
  userType,
  search,
  page,
  limit,
  sortColumn,
  sortDirection,
  loginnedUserType,
  userId,
}) => {
  try {
    sortDirection = sortDirection === 'desc' ? -1 : 1;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;
    let searchQuery = {
      $match: {},
    };
    let femaleQuery = {
      $match: {},
    };
    if (loginnedUserType == 'Member') {
      const loginnedUser = await User.findById(userId);

      if (loginnedUser.gender.toUpperCase() == 'MALE') {
        femaleQuery = {
          $match: {
            $expr: {
              $ne: [{ $toUpper: '$gender' }, 'FEMALE'],
            },
          },
        };
      }
      console.log(JSON.stringify(femaleQuery), ' ', loginnedUser.gender);
    }
    if (search) {
      searchQuery = {
        $match: {
          $or: [
            {
              username: {
                $regex: search,
                $options: 'i',
              },
            },
            {
              email: {
                $regex: search,
                $options: 'i',
              },
            },
            {
              phoneNumber: {
                $regex: search,
                $options: 'i',
              },
            },
          ],
        },
      };
    }
    let sortQuery = {
      $sort: {
        createdDate: sortDirection,
      },
    };
    if (sortColumn === 'username') {
      sortQuery = {
        $sort: {
          username: sortDirection,
        },
      };
    } else if (sortColumn === 'email') {
      sortQuery = {
        $sort: {
          email: sortDirection,
        },
      };
    } else if (sortColumn === 'createdDate') {
      sortQuery = {
        $sort: {
          createdDate: sortDirection,
        },
      };
    } else if (sortColumn === 'phoneNumber') {
      sortQuery = {
        $sort: {
          phoneNumber: sortDirection,
        },
      };
    }
    let result = await User.aggregate([
      femaleQuery,
      {
        $match: {
          userType: userType,
        },
      },
      searchQuery,
      sortQuery,
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: 1,
          email: 1,
          userType: 1,
          gender: 1,
          dateOfBirth: 1,
          phoneNumber: 1,
          createdDate: 1,
          updatedDate: 1,
          weight: { $cond: ['$weight', '$weight', ''] },
          height: { $cond: ['$height', '$height', ''] },
          image: 1,
          // age: {
          //   $divide: [
          //     {
          //       $subtract: [
          //         new Date(),
          //         {
          //           $dateFromString: {
          //             dateString: '$dateOfBirth',
          //             // format: '%d/%m/%Y',
          //           },
          //         },
          //       ],
          //     },
          //     365 * 24 * 60 * 60 * 1000,
          //   ],
          // },

          trainerCode: 1,
        },
      },
      {
        $facet: {
          users: [
            { $skip: parseInt(skip, 10) },
            { $limit: parseInt(limit, 10) },
          ],
          totalCount: [
            {
              $count: 'count',
            },
          ],
        },
      },
    ]);
    let response = {};
    const { users, totalCount } = result[0];
    response.users = users.map((user) => {
      console.log(user.dateOfBirth, ' checking ');
      user.age =
        (new Date().getTime() - new Date(user.dateOfBirth)) /
        (365 * 24 * 60 * 60 * 1000);

      return user;
    });
    response.totalCount = totalCount[0] ? totalCount[0].count : 0;
    response.sortColumn = sortColumn;
    response.sortDirection = sortDirection === -1 ? 'desc' : 'asc';
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
exports.updateUserService = async ({
  userId,
  username,
  gender,
  dateOfBirth,
  phoneNumber,
  address,
  emergencyContact,
  medicalCheckup,
  height,
  weight,
}) => {
  try {
    students = students ? students.split(',') : [];
    let updateData =
      //image
      {
        userId,
        username,
        gender,
        dateOfBirth,
        phoneNumber,
        address,
        emergencyContact,
        medicalCheckup,
        height,
        weight,
      };
    await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    return { message: 'Succesfully Updated' };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
exports.detailUserService = async ({ userId }) => {
  try {
    let result = await User.aggregate([
      {
        $match: { _id: ObjectId(userId) },
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          email: 1,
          userType: 1,
          gender: 1,
          username: 1,
          techanics: 1,
          dateOfBirth: 1,
          height: 1,
          weight: 1,
          description: 1,
          address: 1,
          experience: 1,
          certificate: 1,
          image: 1,
          emergencyContact: 1,
        },
      },
    ]).exec();

    let user = result[0];
    let response;
    if (user.userType == 'Trainer') {
      response = await Promise.all([
        UserBooking.aggregate([
          {
            $match: {
              trainerId: ObjectId(userId),
            },
          },
          {
            $lookup: {
              from: 'users',
              let: { userId: '$userId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$userId'],
                    },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    userId: '$_id',
                    username: 1,
                    image: 1,
                    height: 1,
                    weight: 1,
                    image: 1,
                    dateOfBirth: 1,
                    trainerCode: 1,
                  },
                },
              ],
              as: 'user',
            },
          },
          {
            $unwind: '$user',
          },
          {
            $lookup: {
              from: 'diet_plans',
              let: { dietPlans: '$suggestion.dietPlans' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ['$_id', '$$dietPlans'],
                    },
                  },
                },
                {
                  $project: {
                    _id: 1,
                    type: 1,
                    name: 1,
                    image: 1,
                    calorie: 1,
                  },
                },
              ],
              as: 'dietPlan',
            },
          },
          {
            $project: {
              _id: 1,
              bookId: '$_id',
              techanics: 1,
              startTime: '$startTime',
              endTime: '$endTime',
              user: 1,
              status: 1,
              review: 1,
              rating: 1,
              weight_comparison: {
                $cond: ['$weight_comparison', '$weight_comparison', {}],
              },
              suggestion: {
                burnCalorie: {
                  $cond: [
                    '$suggestion.burnCalorie',
                    '$suggestion.burnCalorie',
                    0,
                  ],
                },
                dietPlans: '$dietPlan',
              },
            },
          },
        ]),
        Payment.find(
          { payUserId: ObjectId(userId) },
          {
            _id: 0,
            paymentId: '$_id',
            amount: 1,
            currency: 1,
            description: 1,
            status: 1,
            createdDate: 1,
          }
        ),
      ]);
    } else if (user.userType == 'Member') {
      response = await Promise.all([
        UserBooking.aggregate([
          {
            $match: {
              userId: ObjectId(userId),
            },
          },
          {
            $lookup: {
              from: 'users',
              let: { trainerId: '$trainerId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$trainerId'],
                    },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    userId: '$_id',
                    username: 1,
                    image: 1,
                    height: 1,
                    weight: 1,
                    image: 1,
                    dateOfBirth: 1,
                    trainerCode: 1,
                  },
                },
              ],
              as: 'user',
            },
          },
          {
            $unwind: '$user',
          },
          {
            $lookup: {
              from: 'diet_plans',
              let: { dietPlans: '$suggestion.dietPlans' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ['$_id', '$$dietPlans'],
                    },
                  },
                },
                {
                  $project: {
                    _id: 1,
                    type: 1,
                    name: 1,
                    image: 1,
                    calorie: 1,
                  },
                },
              ],
              as: 'dietPlan',
            },
          },
          {
            $project: {
              _id: 1,
              bookId: '$_id',
              techanics: 1,
              startTime: '$startTime',
              endTime: '$endTime',
              user: 1,
              status: 1,
              review: 1,
              rating: 1,
              weight_comparison: {
                $cond: ['$weight_comparison', '$weight_comparison', {}],
              },
              suggestion: {
                burnCalorie: {
                  $cond: [
                    '$suggestion.burnCalorie',
                    '$suggestion.burnCalorie',
                    0,
                  ],
                },
                dietPlans: '$dietPlan',
              },
            },
          },
        ]),
        Payment.find(
          { payUserId: ObjectId(userId) },
          {
            _id: 0,
            paymentId: '$_id',
            amount: 1,
            currency: 1,
            description: 1,
            status: 1,
            createdDate: 1,
          }
        ),
      ]);
    }
    let books = [],
      payments = [];
    if (user.userType != 'Admin') {
      books = response[0];
      payments = response[1];
    }

    return { user, books, payments };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
exports.deleteUserService = async ({ userId }) => {
  try {
    await User.deleteOne({ _id: ObjectId(userId) });
    return { message: 'Successfully Deleted' };
  } catch (error) {
    throw error;
  }
};
// exports.createStudentService = async ({
//   username,
//   email,
//   gender,
//   dateOfBirth,
//   image,
//   year,
//   parent,
//   password,
//   paymentInfo,
//   relationship,
// }) => {
//   try {
//     password = await updateHash(password);
//     let user = new User({
//       username,
//       email,
//       gender,
//       dateOfBirth,
//       image,
//       year,
//       password,
//       parent,
//       relationship,
//       role: 'Student',
//     });
//     let oldStudent = await User.findOne({ email });
//     if (oldStudent) {
//       let duplicateError = new Error('Account already exist with this email');
//       duplicateError.status = 400;
//       throw duplicateError;
//     } else {
//       let result = await user.save();
//       if (paymentInfo.amount) {
//         let { amount, months, description, payDate = new Date() } = paymentInfo;
//         let payment = new Payment({
//           amount,
//           months,
//           description,
//           payDate,
//           studentId: result._id,
//           parentId: parent,
//         });
//         await payment.save();
//       }
//       delete result.password;
//       result.studentId = result._id;
//       delete result._id;
//       return { message: 'Successfully Created', student: result };
//     }
//   } catch (error) {
//     throw error;
//   }
// };
exports.loginService = async ({ email, password }) => {
  try {
    const user = await User.findOne({ email });
    console.log(email);
    if (user) {
      const { _id: userId, userType = 'Student' } = user;

      const token = jwt.sign(
        {
          userId,
          userType,
        },
        privateKey,
        {
          algorithm: 'RS256',
        }
      );
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        delete user.password;
        return {
          message: 'Successfully Login',
          user: {
            userId: user._id,
            email: user.email,
            userType: user.userType,
            doneMemberInfo: user.doneMemberInfo || false,
            doneBodyInfo: user.doneBodyInfo || false,
          },
          token,
        };
      } else {
        let passwordWrong = new Error('Password is wrong.');
        passwordWrong.status = 400;
        throw passwordWrong;
      }
    } else {
      let notFoundError = new Error('User does not exist with this email');
      notFoundError.status = 400;
      throw notFoundError;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.getUserHomeService = async ({ userId, bookingDate }) => {
  try {
    bookingDate = new Date(bookingDate);
    let startDate = new Date(bookingDate.setHours(0, 0, 0, 0));
    let endDate = new Date(bookingDate.setHours(23, 59, 59, 59));

    let result = await Promise.all([
      UserBooking.aggregate([
        {
          $match: {
            $expr: {
              $and: [
                {
                  $or: [
                    { $eq: ['$userId', ObjectId(userId)] },
                    { $in: [ObjectId(userId), '$relative'] },
                  ],
                },
                { $ne: ['$status', 'Reject'] },
              ],
            },
          },
        },
        {
          $match: {
            $expr: {
              $and: [
                { $gte: ['$startTime', startDate] },
                { $lte: ['$endTime', endDate] },
              ],
            },
          },
        },
        {
          $lookup: {
            from: 'users',
            let: { userId: '$userId', relative: '$relative' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $ne: ['$_id', ObjectId(userId)] },
                      {
                        $or: [
                          { $eq: ['$_id', '$$userId'] },
                          { $in: ['$_id', '$$relative'] },
                        ],
                      },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  userId: '$_id',
                  username: 1,
                },
              },
            ],
            as: 'relative',
          },
        },
        {
          $lookup: {
            from: 'users',
            let: { trainerId: '$trainerId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', '$$trainerId'],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  userId: '$_id',
                  username: 1,
                  image: 1,
                  height: 1,
                  weight: 1,
                  image: 1,
                  age: {
                    $floor: {
                      $divide: [
                        {
                          $subtract: [
                            new Date(),
                            {
                              $dateFromString: {
                                dateString: '$dateOfBirth',
                                format: '%Y-%m-%d',
                              },
                            },
                          ],
                        },
                        365 * 24 * 60 * 60 * 1000,
                      ],
                    },
                  },
                  trainerCode: 1,
                },
              },
            ],
            as: 'trainer',
          },
        },
        {
          $match: {
            $expr: {
              $gt: [{ $size: '$trainer' }, 0],
            },
          },
        },
        {
          $project: {
            _id: 1,
            bookId: '$_id',
            techanics: 1,
            startTime: '$startTime',
            endTime: '$endTime',
            trainer: 1,
            status: 1,
            relative: 1,
            weight_comparison: {
              $cond: [
                {
                  $gte: [
                    {
                      $indexOfArray: [
                        '$weight_comparison.userId',
                        ObjectId(userId),
                      ],
                    },
                    0,
                  ],
                },
                {
                  $arrayElemAt: [
                    '$weight_comparison',
                    {
                      $indexOfArray: [
                        '$weight_comparison.userId',
                        ObjectId(userId),
                      ],
                    },
                  ],
                },
                null,
              ],
            },
            suggestion: {
              $cond: [
                {
                  $gte: [
                    {
                      $indexOfArray: ['$suggestion.userId', ObjectId(userId)],
                    },
                    0,
                  ],
                },
                {
                  $arrayElemAt: [
                    '$suggestion',
                    {
                      $indexOfArray: ['$suggestion.userId', ObjectId(userId)],
                    },
                  ],
                },
                null,
              ],
            },
          },
        },
      ]),
      User.aggregate([
        {
          $match: { userType: 'Trainer', recommend: true },
        },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            username: 1,
            age: {
              $floor: {
                $divide: [
                  {
                    $subtract: [
                      new Date(),
                      {
                        $dateFromString: {
                          dateString: '$dateOfBirth',
                          format: '%Y-%m-%d',
                        },
                      },
                    ],
                  },
                  365 * 24 * 60 * 60 * 1000,
                ],
              },
            },
            height: 1,
            weight: 1,
            image: 1,
            trainerCode: 1,
          },
        },
      ]),
    ]);
    let todayBooking = result[0];
    const suggestions = result[1];
    // todayBooking
    //   ? (todayBooking.trainingDay = moment(
    //       todayBooking.startTime,
    //       'YYYY/MM/DD'
    //     ).format('LL'))
    //   : '';
    // todayBooking
    //   ? (todayBooking.trainingEndTime = todayBooking.startTime
    //       .addHours(1)
    //       .setMinutes(todayBooking.startTime.getMinutes() + 30))
    //   : '';
    // todayBooking
    //   ? (todayBooking.trainingTime =
    //       moment(todayBooking.).format('LT') +
    //       '-' +
    //       moment(todayBooking.trainingEndTime).format('LT'))
    //   : '';
    todayBooking = todayBooking ? todayBooking : null;
    // todayBooking
    //   ? (todayBooking.trainer[0].age = Math.floor(todayBooking.trainer[0].age))
    //   : '';
    return { todayBooking: todayBooking || [], suggestions };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
exports.getBookingHistroyService = async ({ userId, userType }) => {
  try {
    let matchQuery = {
      $match: {},
    };
    let memberRelativeQuery = [];
    if (userType == 'Trainer') {
      matchQuery = {
        $match: {
          trainerId: ObjectId(userId),
        },
      };
      memberRelativeQuery = [
        {
          $lookup: {
            from: 'users',
            let: {
              userId: '$userId',
              weight_comparison: '$weight_comparison',
              suggestion: '$suggestion',
            },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$userId'] },
                },
              },
              {
                $project: {
                  _id: 0,
                  username: 1,
                  phoneNumber: 1,
                  image: 1,
                  height: 1,
                  weight: 1,
                  medicalCheckUp: 1,
                  address: 1,
                  dateOfBirth: 1,
                  weight_comparison: {
                    $cond: [
                      {
                        $gte: [
                          {
                            $indexOfArray: [
                              '$$weight_comparison.userId',
                              '$_id',
                            ],
                          },
                          0,
                        ],
                      },
                      {
                        $arrayElemAt: [
                          '$$weight_comparison',
                          {
                            $indexOfArray: [
                              '$$weight_comparison.userId',
                              '$_id',
                            ],
                          },
                        ],
                      },
                      null,
                    ],
                  },
                  suggestion: {
                    $cond: [
                      {
                        $gte: [
                          {
                            $indexOfArray: ['$$suggestion.userId', '$_id'],
                          },
                          0,
                        ],
                      },
                      {
                        $arrayElemAt: [
                          '$$suggestion',
                          {
                            $indexOfArray: ['$$suggestion.userId', '$_id'],
                          },
                        ],
                      },
                      null,
                    ],
                  },
                },
              },
            ],
            as: 'member',
          },
        },
        {
          $unwind: {
            path: '$member',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            let: {
              relative: '$relative',
              weight_comparison: '$weight_comparison',
              suggestion: '$suggestion',
            },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ['$_id', '$$relative'] },
                },
              },
              {
                $project: {
                  _id: 0,
                  userId: '$_id',
                  username: 1,
                  weight_comparison: {
                    $cond: [
                      {
                        $gte: [
                          {
                            $indexOfArray: [
                              '$$weight_comparison.userId',
                              '$_id',
                            ],
                          },
                          0,
                        ],
                      },
                      {
                        $arrayElemAt: [
                          '$$weight_comparison',
                          {
                            $indexOfArray: [
                              '$$weight_comparison.userId',
                              '$_id',
                            ],
                          },
                        ],
                      },
                      null,
                    ],
                  },
                  suggestion: {
                    $cond: [
                      {
                        $gte: [
                          {
                            $indexOfArray: ['$$suggestion.userId', '$_id'],
                          },
                          0,
                        ],
                      },
                      {
                        $arrayElemAt: [
                          '$$suggestion',
                          {
                            $indexOfArray: ['$$suggestion.userId', '$_id'],
                          },
                        ],
                      },
                      null,
                    ],
                  },
                },
              },
            ],
            as: 'relative',
          },
        },
      ];
    } else if (userType == 'Member') {
      matchQuery = {
        $match: {
          $expr: {
            $or: [
              { $eq: ['$userId', ObjectId(userId)] },
              { $in: [ObjectId(userId), '$relative'] },
            ],
          },
        },
      };
      memberRelativeQuery = [
        {
          $lookup: {
            from: 'users',
            let: { userId: '$userId', relative: '$relative' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', ObjectId(userId)] },
                },
              },
              {
                $project: {
                  _id: 0,
                  username: 1,
                  phoneNumber: 1,
                  image: 1,
                  height: 1,
                  weight: 1,
                  medicalCheckUp: 1,
                  address: 1,
                  dateOfBirth: 1,
                },
              },
            ],
            as: 'member',
          },
        },
        {
          $unwind: {
            path: '$member',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            let: { userId: '$userId', relative: '$relative' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $ne: ['$_id', ObjectId(userId)] },
                      {
                        $or: [
                          { $eq: ['$_id', '$$userId'] },
                          { $in: ['$_id', '$$relative'] },
                        ],
                      },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  userId: '$_id',
                  username: 1,
                },
              },
            ],
            as: 'relative',
          },
        },
      ];
    }
    let result = await UserBooking.aggregate([
      matchQuery,
      {
        $lookup: {
          from: 'users',
          let: { trainerId: '$trainerId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$trainerId'],
                },
              },
            },
            {
              $project: {
                _id: 0,
                userId: '$_id',
                username: 1,
                image: 1,
                height: 1,
                weight: 1,
                image: 1,
                age: {
                  $floor: {
                    $divide: [
                      {
                        $subtract: [
                          new Date(),
                          {
                            $dateFromString: {
                              dateString: '$dateOfBirth',
                              format: '%Y-%m-%d',
                            },
                          },
                        ],
                      },
                      365 * 24 * 60 * 60 * 1000,
                    ],
                  },
                },
                trainerCode: 1,
              },
            },
          ],
          as: 'trainer',
        },
      },
      {
        $unwind: {
          path: '$trainer',
          preserveNullAndEmptyArrays: true,
        },
      },
      ...memberRelativeQuery,
      {
        $sort: {
          startTime: -1,
        },
      },
      {
        $project: {
          _id: 1,
          bookId: '$_id',
          techanics: 1,
          startTime: '$startTime',
          endTime: '$endTime',
          trainer: 1,
          member: 1,
          status: 1,
          relative: 1,
          weight_comparison: {
            $cond: [
              {
                $gte: [
                  {
                    $indexOfArray: [
                      '$weight_comparison.userId',
                      ObjectId(userId),
                    ],
                  },
                  0,
                ],
              },
              {
                $arrayElemAt: [
                  '$weight_comparison',
                  {
                    $indexOfArray: [
                      '$weight_comparison.userId',
                      ObjectId(userId),
                    ],
                  },
                ],
              },
              null,
            ],
          },
          suggestion: {
            $cond: [
              {
                $gte: [
                  {
                    $indexOfArray: ['$suggestion.userId', ObjectId(userId)],
                  },
                  0,
                ],
              },
              {
                $arrayElemAt: [
                  '$suggestion',
                  {
                    $indexOfArray: ['$suggestion.userId', ObjectId(userId)],
                  },
                ],
              },
              null,
            ],
          },
        },
      },
    ]);
    console.log(result + 'gg');
    return result;
  } catch (error) {
    throw error;
  }
};
exports.getBookingDateService = async ({ userId, userType }) => {
  try {
    let matchQuery = {
      $match: {},
    };
    if (userType == 'Trainer') {
      matchQuery = {
        $match: {
          trainerId: ObjectId(userId),
        },
      };
    } else if (userType == 'Member') {
      matchQuery = {
        $match: {
          userId: ObjectId(userId),
        },
      };
    }
    let result = await UserBooking.aggregate([
      matchQuery,
      {
        $project: {
          _id: 0,
          startTime: 1,
        },
      },
    ]);
    return result;
  } catch (error) {
    throw error;
  }
};
exports.saveFirebaseTokenService = async ({ userId, firebaseToken }) => {
  try {
    console.log(firebaseToken + ' firebaseToken');
    await User.findByIdAndUpdate(userId, { firebaseToken });
    return { message: 'Successfully Updated' };
  } catch (error) {
    throw error;
  }
};
exports.getNotificationService = async ({ userId }) => {
  try {
    let result = await Notification.find(
      { to: ObjectId(userId) },
      {
        _id: 0,
        notiId: '$_id',
        title: 1,
        body: 1,
        type: { $cond: ['$type', '$type', 'booking'] },
        createdDate: 1,
      }
    ).sort({ createdDate: -1 });
    const response = result.map((noti) => {
      const { notiId, title, body, type } = noti;
      const ago = new TimeAgo('en-MY').format(noti.createdDate);
      console.log(ago);
      return { notiId, title, body, type, ago };
    });
    return response;
  } catch (error) {
    throw error;
  }
};
exports.updateTrainerLocationService = async ({
  userId,
  latitude,
  longitude,
}) => {
  try {
    await User.findByIdAndUpdate(userId, {
      metadata: { latitude, longitude },
    });

    return { message: 'Successfully Updated' };
  } catch (error) {
    throw error;
  }
};
exports.getTrainerLocationService = async ({ trainerId }) => {
  try {
    let trainer = await User.findById(trainerId);
    const { metadata } = trainer;
    const { latitude, longitude } = metadata;
    return { latitude, longitude };
  } catch (error) {
    throw error;
  }
};
exports.addNewAddressService = async ({ userId, userType, newAddress }) => {
  try {
    let user = await User.findById(userId);
    const { muli_address = [], address } = user;
    muli_address.push(address);
    await User.updateOne(
      { _id: ObjectId(userId) },
      { $set: { address: newAddress, muli_address } }
    );
    return { message: 'Successfully Updated' };
  } catch (error) {
    throw error;
  }
};
exports.updateAddressService = async ({ userId, address }) => {
  try {
    let user = await User.findById(userId);
    const { muli_address = [] } = user;
    muli_address.push(address);
    await User.updateOne(
      { _id: ObjectId(userId) },
      {
        $set: {
          address,
          muli_address,
        },
      }
    );
    return { message: 'Successfully Updated' };
  } catch (error) {
    throw error;
  }
};
exports.changePasswordService = async ({
  currentPassword,
  newPassword,
  userId,
}) => {
  try {
    const user = await User.findById(userId);
    if (user) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (isMatch) {
        newPassword = await updateHash(newPassword);
        await User.findByIdAndUpdate(userId, {
          $set: { password: newPassword },
        });
        return { message: 'Successfully Updated' };
      } else {
        let passwordWrong = new Error('Password is wrong.');
        passwordWrong.status = 400;
        throw passwordWrong;
      }
    } else {
      return { message: 'Successfully Updated' };
    }
  } catch (error) {}
};
Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};
function updateHash(password) {
  try {
    return new Promise((resolve, reject) => {
      const hash = bcrypt.hashSync(password, 13);
      resolve(hash);
    });
  } catch (err) {
    throw err;
  }
}
