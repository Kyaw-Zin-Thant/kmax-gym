const User = require('../models/user.model');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const bcrypt = require('bcrypt');
const fs = require('fs');
const privateKey = fs.readFileSync('config/jwtRS256.key', 'utf8');
const publicKey = fs.readFileSync('config/jwtRS256.key.pub', 'utf8');
const jwt = require('jsonwebtoken');
const Base64 = require('../config/base64');
exports.createUserService = async ({ email, password, userType }) => {
  try {
    password = Base64.decode(password);
    password = await updateHash(password);
    const user = new User({ email, password, userType }).save();
    return { message: 'Successfully created', userId: user._id };
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
    }).save();
    return { message: 'Successfully created', userId: user._id };
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
// exports.detailUserService = async ({ userId }) => {
//   try {
//     console.log('in detail');
//     let result = await User.aggregate([
//       {
//         $match: { _id: ObjectId(userId) },
//       },
//       {
//         $project: {
//           _id: 0,
//           userId: '$_id',
//           username: 1,
//           email: 1,
//           role: 1,
//           gender: 1,
//           dateOfBirth: 1,
//           image: 1,
//           address: 1,
//           relationship: 1,
//           phoneNumber: 1,
//           createdDate: 1,
//           updatedDate: 1,
//           position: 1,
//           education: 1,
//           emergencyContact: 1,
//           startDate: 1,
//           parent: 1,
//           year: 1,
//         },
//       },
//     ]).exec();
//     let user = result[0];
//     console.log(result[0].userId);
//     if (user.role == 'Parent') {
//       let students = await User.find({ parent: ObjectId(userId) });
//       students = students.map((student) => {
//         student.studentId = student._id;
//         delete student._id;
//         return student;
//       });
//       console.log(students);
//       user.students = students;
//     } else if (user.role == 'Student') {
//       let studentResult = await Promise.all([
//         Payment.findOne({
//           studentId: ObjectId(userId),
//           parentId: user.parent,
//         }).sort({ _id: -1 }),
//         Year.findOne({ _id: user.year }),
//       ]);
//       let paymentInfo = studentResult[0];
//       let year = studentResult[1] || {};
//       if (paymentInfo) {
//         const {
//           _id: paymentId,
//           amount,
//           months,
//           description,
//           payDate,
//         } = paymentInfo;
//         user.paymentInfo = { paymentId, amount, months, description, payDate };
//       } else {
//         user.paymentInfo = {};
//       }
//       if (year) {
//         const { _id: yearId, name } = year;
//         user.year = { yearId, name };
//       } else {
//         user.year = {};
//       }
//     }
//     return { user };
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };
// exports.deleteUserService = async ({ userId }) => {
//   try {
//     await User.deleteOne({ _id: ObjectId(userId) });
//     return { message: 'Successfully Deleted' };
//   } catch (error) {
//     throw error;
//   }
// };
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
// function updateHash(password) {
//   try {
//     return new Promise((resolve, reject) => {
//       const hash = bcrypt.hashSync(password, 13);
//       resolve(hash);
//     });
//   } catch (err) {
//     throw err;
//   }
// }
// // exports.getStudentService = async ({
// //   search,
// //   page,
// //   limit,
// //   sortColumn,
// //   sortDirection,
// // }) => {
// //   try {
// //     sortDirection = sortDirection === 'desc' ? -1 : 1;

// //     page = parseInt(page);
// //     limit = parseInt(limit);
// //     const skip = (page - 1) * limit;
// //     let searchQuery = {
// //       $match: {},
// //     };
// //     if (search) {
// //       searchQuery = {
// //         $match: {
// //           $or: [
// //             {
// //               username: {
// //                 $regex: search,
// //                 $options: 'i',
// //               },
// //             },
// //             {
// //               email: {
// //                 $regex: search,
// //                 $options: 'i',
// //               },
// //             },
// //           ],
// //         },
// //       };
// //     }
// //     let sortQuery = {
// //       $sort: {
// //         createdDate: -1,
// //       },
// //     };
// //     if (sortColumn === 'username') {
// //       sortQuery = {
// //         $sort: {
// //           username: sortDirection,
// //         },
// //       };
// //     } else if (sortColumn === 'email') {
// //       sortQuery = {
// //         $sort: {
// //           email: sortDirection,
// //         },
// //       };
// //     } else if (sortColumn === 'createdDate') {
// //       sortQuery = {
// //         $sort: {
// //           createdDate: sortDirection,
// //         },
// //       };
// //     }
// //     let result = await Student.aggregate([
// //       {
// //         $match: {
// //           role: role,
// //         },
// //       },
// //       searchQuery,
// //       sortQuery,
// //       {
// //         $project: {
// //           _id: 0,
// //           userId: '$_id',
// //           username: 1,
// //           email: 1,
// //           phoneNumber: '',
// //           createdDate: 1,
// //         },
// //       },
// //       {
// //         $facet: {
// //           users: [
// //             { $skip: parseInt(skip, 10) },
// //             { $limit: parseInt(limit, 10) },
// //           ],
// //           totalCount: [
// //             {
// //               $count: 'count',
// //             },
// //           ],
// //         },
// //       },
// //     ]);
// //     let response = {};
// //     const { users, totalCount } = result[0];
// //     response.users = users;
// //     response.totalCount = totalCount[0] ? totalCount[0].count : 0;
// //     response.sortColumn = sortColumn;
// //     response.sortDirection = sortDirection === -1 ? 'desc' : 'asc';
// //     return response;
// //   } catch (error) {
// //     throw error;
// //   }
// // };
// // exports.detailStudentService = async ({ studentId }) => {
// //   try {
// //     let user = await Student.aggregate([
// //       {
// //         $match: {
// //           _id: ObjectId(studentId),
// //         },
// //       },
// //       {
// //         $lookup: {
// //           from: 'users',
// //           let: { parentId: '$parent' },
// //           pipeline: [
// //             {
// //               $match: {
// //                 $expr: {
// //                   $eq: ['$_id', '$$parentId'],
// //                 },
// //               },
// //             },
// //             {
// //               $project: {
// //                 _id: 0,
// //                 parentId: '$_id',
// //                 name: 1,
// //                 email: 1,
// //               },
// //             },
// //           ],
// //           as: 'parent',
// //         },
// //       },
// //       {
// //         $unwind: {
// //           path: '$parent',
// //           preserveNullAndEmptyArrays: true,
// //         },
// //       },
// //       {
// //         $lookup: {
// //           from: 'years',
// //           let: { yearId: '$year' },
// //           pipeline: [
// //             {
// //               $match: {
// //                 $expr: {
// //                   $eq: ['$_id', '$$yearId'],
// //                 },
// //               },
// //             },
// //             {
// //               $project: {
// //                 _id: 0,
// //                 yearId: '$_id',
// //                 name: 1,
// //               },
// //             },
// //           ],
// //           as: 'year',
// //         },
// //       },
// //       {
// //         $unwind: {
// //           path: '$year',
// //           preserveNullAndEmptyArrays: true,
// //         },
// //       },
// //       {
// //         $lookup: {
// //           from: 'payments',
// //           let: { studentId: '$_id' },
// //           pipeline: [
// //             {
// //               $match: {
// //                 $expr: {
// //                   $eq: ['$studentId', '$$studentId'],
// //                 },
// //               },
// //             },
// //             {
// //               $project: {
// //                 _id: 0,
// //                 paymentId: '$_id',
// //                 amount: 1,
// //                 months: 1,
// //                 description: 1,
// //               },
// //             },
// //           ],
// //           as: 'paymentInfo',
// //         },
// //       },
// //       {
// //         $project: {
// //           _id: 0,
// //           userId: '$_id',
// //           username: 1,
// //           email: 1,
// //           gender: 1,
// //           dateOfBirth: 1,
// //           relationship: { $cond: ['$relationship', '$relationship', ''] },
// //           image: 1,
// //           year: 1,
// //           parent: 1,
// //           paymentInfo: {
// //             $cond: [
// //               { $size: '$paymentInfo' },
// //               { $arrayElemAt: ['paymentInfo', 0] },
// //               {},
// //             ],
// //           },
// //         },
// //       },
// //     ]);
// //     return { user };
// //   } catch (error) {
// //     throw error;
// //   }
// // };
// exports.getParentHomeService = async ({ userId }) => {
//   try {
//     let startDate = new Date();
//     let endDate = new Date();
//     startDate.setHours(0, 0, 0, 0);
//     endDate.setHours(23, 59, 59, 59);
//     const result = await Promise.all([
//       User.find({ parentId: ObjectId(userId) }, { _id: 1 }),
//       Payment.aggregate([
//         {
//           $match: {
//             parentId: ObjectId(userId),
//           },
//         },
//         {
//           $lookup: {
//             from: 'users',
//             let: { studentId: '$studentId' },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $eq: ['$_id', '$$studentId'],
//                   },
//                 },
//               },
//               {
//                 $project: {
//                   _id: 0,
//                   studentId: '$_id',
//                   username: 1,
//                 },
//               },
//             ],
//             as: 'student',
//           },
//         },
//         {
//           $unwind: {
//             path: '$student',
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $project: {
//             _id: 0,
//             studentName: '$student.username',
//             startDate: '$payDate',
//             months: 1,
//             amount: 1,
//             status: 1,
//           },
//         },
//       ]),
//     ]);
//     const students = result[0].map((student) => student._id);
//     const payments = result[1].map((payment) => {
//       const { startDate, months } = payment;
//       payment.endDate = new Date(
//         startDate.setMonth(startDate.getMonth() + months)
//       );
//       delete payment.months;
//       return payment;
//     });
//     const attendance = await ClassAttendance.aggregate([
//       {
//         $match: {
//           studentId: { $in: students },
//           createdDate: {
//             $gte: startDate,
//             $lte: endDate,
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: 'users',
//           let: { studentId: '$studentId' },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $eq: ['$_id', '$$studentId'],
//                 },
//               },
//             },
//             {
//               $project: {
//                 _id: 0,
//                 studentId: '$_id',
//                 username: 1,
//               },
//             },
//           ],
//           as: 'student',
//         },
//       },
//       {
//         $unwind: {
//           path: '$student',
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $lookup: {
//           from: 'classes',
//           let: { classId: '$classId' },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $eq: ['$_id', '$$classId'],
//                 },
//               },
//             },
//             {
//               $project: {
//                 _id: 0,
//                 classId: '$_id',
//                 name: 1,
//                 startTime: 1,
//               },
//             },
//           ],
//           as: 'class',
//         },
//       },
//       {
//         $unwind: {
//           path: '$class',
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           studentName: '$student.username',
//           className: '$class.name',
//           attendance: '$attendance',
//           time: '$class.startTime',
//         },
//       },
//     ]);
//     return { payments, attendance };
//   } catch (error) {
//     throw error;
//   }
// };
// exports.getTeacherAssements = async ({
//   search,
//   page,
//   limit,
//   sortColumn,
//   sortDirection,
// }) => {
//   let skip = parseInt(page, 10) - 1;
//   limit = parseInt(limit, 10);
//   sortDirection = sortDirection === 'desc' ? -1 : 1;
//   let searchQuery = {
//     $match: {},
//   };
//   if (search) {
//     searchQuery = {
//       $match: {
//         $or: [
//           {
//             title: {
//               $regex: search,
//               $options: 'i',
//             },
//           },
//           {
//             'year.name': {
//               $regex: search,
//               $options: 'i',
//             },
//           },
//           {
//             description: {
//               $regex: search,
//               $options: 'i',
//             },
//           },
//         ],
//       },
//     };
//   }
//   let sortQuery = {
//     $sort: {
//       title: sortDirection,
//     },
//   };
//   if (sortColumn == 'year') {
//     sortQuery = {
//       $sort: {
//         'year.name': sortDirection,
//       },
//     };
//   } else if (sortColumn == 'description') {
//     sortQuery = {
//       $sort: {
//         description: sortDirection,
//       },
//     };
//   } else if (sortColumn == 'date') {
//     sortQuery = {
//       $sort: {
//         date: sortDirection,
//       },
//     };
//   }
//   let result = await Assement.aggregate([
//     {
//       $lookup: {
//         from: 'years',
//         let: { yearId: '$year' },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $eq: ['$_id', '$$yearId'],
//               },
//             },
//           },
//           {
//             $project: {
//               _id: 0,
//               name: 1,
//             },
//           },
//         ],
//         as: 'year',
//       },
//     },
//     {
//       $unwind: {
//         path: '$year',
//         preserveNullAndEmptyArrays: true,
//       },
//     },
//     searchQuery,
//     sortQuery,
//     {
//       $project: {
//         _id: 0,
//         assementId: '$_id',
//         title: 1,
//         year: '$year.name',
//         description: 1,
//         date: '$createdDate',
//       },
//     },
//     {
//       $facet: {
//         assements: [{ $skip: skip }, { $limit: limit }],
//         totalCount: [
//           {
//             $count: 'count',
//           },
//         ],
//       },
//     },
//   ]);
//   let response = {};
//   const { assements, totalCount } = result[0];
//   response.assements = assements;
//   response.totalCount = totalCount[0] ? totalCount[0].count : 0;
//   response.sortColumn = sortColumn;
//   response.sortDirection = sortDirection === -1 ? 'desc' : 'asc';
//   return response;
// };
// exports.getAdminHomePaymentInfoService = async ({
//   page,
//   limit,
//   sortColumn,
//   sortDirection,
// }) => {
//   try {
//     let skip = parseInt(page, 10) - 1;
//     limit = parseInt(limit, 10);
//     sortDirection = sortDirection === 'desc' ? -1 : 1;
//     let sortQuery = {
//       $sort: {
//         payDate: sortDirection,
//       },
//     };
//     if (sortColumn == 'studentName') {
//       sortQuery = {
//         $sort: {
//           studentName: sortDirection,
//         },
//       };
//     } else if (sortColumn == 'className') {
//       sortQuery = {
//         $sort: {
//           className: sortDirection,
//         },
//       };
//     } else if (sortColumn == 'duration') {
//       sortQuery = {
//         $sort: {
//           duration: sortDirection,
//         },
//       };
//     } else if (sortColumn == 'amount') {
//       sortQuery = {
//         $sort: {
//           amount: sortDirection,
//         },
//       };
//     }
//     let result = await Payment.aggregate([
//       {
//         $lookup: {
//           from: 'users',
//           let: { studentId: '$studentId' },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $eq: ['$_id', '$$studentId'],
//                 },
//               },
//             },
//             {
//               $project: {
//                 _id: 0,
//                 studentId: '$_id',
//                 username: 1,
//               },
//             },
//           ],
//           as: 'student',
//         },
//       },
//       {
//         $unwind: {
//           path: '$student',
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $lookup: {
//           from: 'classes',
//           let: { studentId: '$studentId' },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $in: ['$$studentId', '$students'],
//                 },
//               },
//             },
//             {
//               $project: {
//                 _id: 0,
//                 classId: '$_id',
//                 name: 1,
//               },
//             },
//           ],
//           as: 'class',
//         },
//       },
//       {
//         $unwind: {
//           path: '$class',
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           paymentId: '$_id',
//           payDate: 1,
//           amount: 1,
//           duration: {
//             $concat: [
//               { $convert: { input: '$months', to: 'string' } },
//               ' months',
//             ],
//           },
//           className: { $cond: ['$class', '$class.name', ''] },
//           studentName: { $cond: ['$student', '$student.username', ''] },
//         },
//       },
//       sortQuery,
//       {
//         $facet: {
//           paymentInfo: [{ $skip: skip }, { $limit: limit }],
//           totalCount: [
//             {
//               $count: 'count',
//             },
//           ],
//         },
//       },
//     ]);
//     let response = {};
//     const { paymentInfo, totalCount } = result[0];
//     response.paymentInfo = paymentInfo;
//     response.totalCount = totalCount[0] ? totalCount[0].count : 0;
//     response.sortColumn = sortColumn;
//     response.sortDirection = sortDirection === -1 ? 'desc' : 'asc';
//     return response;
//   } catch (error) {
//     throw error;
//   }
// };
// exports.getTeacherAssementScoresService = async ({
//   search,
//   page,
//   limit,
//   sortColumn,
//   sortDirection,
// }) => {
//   let skip = parseInt(page, 10) - 1;
//   limit = parseInt(limit, 10);
//   sortDirection = sortDirection === 'desc' ? -1 : 1;
//   let searchQuery = {
//     $match: {},
//   };
//   if (search) {
//     searchQuery = {
//       $match: {
//         $or: [
//           {
//             'class.name': {
//               $regex: search,
//               $options: 'i',
//             },
//           },
//           {
//             assement: {
//               $regex: search,
//               $options: 'i',
//             },
//           },
//           {
//             assementType: {
//               $regex: search,
//               $options: 'i',
//             },
//           },
//           {
//             maxScore: {
//               $regex: search,
//               $options: 'i',
//             },
//           },
//         ],
//       },
//     };
//   }
//   let sortQuery = {
//     $sort: {
//       title: sortDirection,
//     },
//   };
//   if (sortColumn == 'className') {
//     sortQuery = {
//       $sort: {
//         'class.name': sortDirection,
//       },
//     };
//   } else if (sortColumn == 'assement') {
//     sortQuery = {
//       $sort: {
//         assement: sortDirection,
//       },
//     };
//   } else if (sortColumn == 'assementType') {
//     sortQuery = {
//       $sort: {
//         assementType: sortDirection,
//       },
//     };
//   } else if (sortColumn == 'maxScore') {
//     sortQuery = {
//       $sort: {
//         maxScore: sortDirection,
//       },
//     };
//   } else if (sortColumn == 'concept') {
//     sortQuery = {
//       $sort: {
//         concept: sortDirection,
//       },
//     };
//   } else if (sortColumn == 'date') {
//     sortQuery = {
//       $sort: {
//         createdDate: sortDirection,
//       },
//     };
//   }
//   let result = await AssementScore.aggregate([
//     {
//       $lookup: {
//         from: 'classes',
//         let: { classId: '$classId' },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $eq: ['$_id', '$$classId'],
//               },
//             },
//           },
//           {
//             $project: {
//               _id: 0,
//               name: 1,
//             },
//           },
//         ],
//         as: 'class',
//       },
//     },
//     {
//       $unwind: {
//         path: '$class',
//         preserveNullAndEmptyArrays: true,
//       },
//     },
//     {
//       $lookup: {
//         from: 'assements',
//         let: { assementId: '$assement' },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $eq: ['$_id', '$$assementId'],
//               },
//             },
//           },
//           {
//             $project: {
//               _id: 0,
//               title: 1,
//             },
//           },
//         ],
//         as: 'assement',
//       },
//     },
//     {
//       $unwind: {
//         path: '$assement',
//         preserveNullAndEmptyArrays: true,
//       },
//     },
//     searchQuery,
//     sortQuery,
//     {
//       $project: {
//         _id: 0,
//         assementScoreId: '$_id',
//         className: { $cond: ['$class', '$class.name', ''] },
//         assement: { $cond: ['$assement', '$assement.title', ''] },
//         assementType: 1,
//         maxScore: 1,
//         concept: 1,
//         fileUrl: 1,
//         date: '$createdDate',
//       },
//     },
//     {
//       $facet: {
//         assementscores: [{ $skip: skip }, { $limit: limit }],
//         totalCount: [
//           {
//             $count: 'count',
//           },
//         ],
//       },
//     },
//   ]);
//   let response = {};
//   const { assementscores, totalCount } = result[0];
//   response.assement_scores = assementscores;
//   response.totalCount = totalCount[0] ? totalCount[0].count : 0;
//   response.sortColumn = sortColumn;
//   response.sortDirection = sortDirection === -1 ? 'desc' : 'asc';
//   return response;
// };
// exports.getTeacherTimelineSevice = async () => {
//   try {
//     const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
//     const checkDay = days[new Date().getDay()];
//     const response = await Class.aggregate([
//       {
//         $match: {
//           $expr: {
//             $and: [
//               { $in: [checkDay, '$days'] },
//               { $gte: [new Date(), '$startDate'] },
//               { $lte: [new Date(), '$endDate'] },
//             ],
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: 'users',
//           let: { teacherId: '$teacher' },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $eq: ['$_id', '$$teacherId'],
//                 },
//               },
//             },
//             {
//               $project: {
//                 _id: 0,
//                 username: 1,
//               },
//             },
//           ],
//           as: 'teacher',
//         },
//       },
//       {
//         $unwind: {
//           path: '$teacher',
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           teacherName: { $cond: ['$teacher', '$teacher.username', ''] },
//           startTime: 1,
//           endTime: 1,
//           noOfStudent: { $size: '$students' },
//         },
//       },
//     ]);
//     return { teacher_timeline: response };
//   } catch (error) {
//     throw error;
//   }
// };
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
