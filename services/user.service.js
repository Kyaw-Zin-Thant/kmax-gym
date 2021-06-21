const User = require('../models/user.model');
const UserBookedTrainer = require('../models/user.trainers.model');
const mongoose = require('mongoose');
const moment = require('moment');
const { ObjectId } = mongoose.Types;
const bcrypt = require('bcrypt');
const fs = require('fs');
const privateKey = fs.readFileSync('config/jwtRS256.key', 'utf8');
const publicKey = fs.readFileSync('config/jwtRS256.key.pub', 'utf8');
const jwt = require('jsonwebtoken');
const Base64 = require('../config/base64');
const crypto = require('crypto');
exports.createUserService = async ({ email, password, userType }) => {
  try {
    password = Base64.decode(password);
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
}) => {
  try {
    sortDirection = sortDirection === 'desc' ? -1 : 1;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;
    let searchQuery = {
      $match: {},
    };
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
        createdDate: -1,
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
          age: {
            $divide: [
              {
                $subtract: [
                  new Date(),
                  {
                    $dateFromString: {
                      dateString: '$dateOfBirth',
                      format: '%d/%m/%Y',
                    },
                  },
                ],
              },
              365 * 24 * 60 * 60 * 1000,
            ],
          },

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
    response.users = users;
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
        },
      },
    ]).exec();
    let user = result[0];

    return { user };
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

exports.getUserHomeService = async ({ userId }) => {
  try {
    let startDate = new Date();
    let endDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 59);
    let result = await Promise.all([
      UserBookedTrainer.aggregate([
        {
          $match: {
            userId: ObjectId(userId),
          },
        },
        {
          $unwind: {
            path: '$trainers',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $expr: {
              $and: [
                { $gte: ['trainers.trainingTime', startDate] },
                { $lte: ['trainers.trainingTime', endDate] },
              ],
            },
          },
        },
        {
          $lookup: {
            from: 'users',
            let: { trainerId: '$trainers.userId' },
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
                  name: 1,
                  phoneNumber: 1,
                  image: 1,
                },
              },
            ],
            as: 'trainer',
          },
        },
        {
          $project: {
            _id: 1,
            bookId: '$_id',
            techanics: '$trainers.techanics',
            trainingStartTime: '$trainers.trainingTime',
            trainer: 1,
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
              $divide: [
                {
                  $subtract: [
                    new Date(),
                    {
                      $dateFromString: {
                        dateString: '$dateOfBirth',
                        format: '%d/%m/%Y',
                      },
                    },
                  ],
                },
                365 * 24 * 60 * 60 * 1000,
              ],
            },
            height: 1,
            weight: 1,
            image: 1,
            trainerCode: 1,
          },
        },
      ]),
    ]);
    let todayBooking = result[0][0];
    const suggestions = result[1];
    todayBooking
      ? (todayBooking.trainingDay = moment(
          todayBooking.trainingStartTime,
          'YYYY/MM/DD'
        ).format('LL'))
      : '';
    todayBooking
      ? (todayBooking.trainingEndTime = todayBooking.trainingStartTime
          .addHours(1)
          .setMinutes(trainingStartTime.getMinutes() + 30))
      : '';
    todayBooking
      ? (todayBooking.trainingTime =
          moment(todayBooking.trainingStartTime).format('LT') +
          '-' +
          moment(todayBooking.trainingEndTime).format('LT'))
      : '';

    return { todayBooking: todayBooking || {}, suggestions };
  } catch (error) {
    console.log(error);
    throw error;
  }
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
