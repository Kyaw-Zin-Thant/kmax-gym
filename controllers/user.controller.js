const fs = require('fs');
const Jimp = require('jimp');
const path = require('path');
const {
  createUserService,
  getUserService,
  updateUserService,
  loginService,
  createTrainerService,
  getUserHomeService,
  createAdminService,
  detailUserService,
  deleteUserService,
  updateAdminService,
  getBookingHistroyService,
  saveFirebaseTokenService,
  getNotificationService,
  updateTrainerLocationService,
  getTrainerLocationService,
  addNewAddressService,
} = require('../services/user.service');
exports.createUserController = async (req, res, next) => {
  let { email, password, userType = 'Member' } = req.body;
  try {
    const response = await createUserService({
      email,
      password,
      userType,
    });
    console.log(response);
    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

exports.createTrainerController = async (req, res, next) => {
  let {
    email,
    password,
    userType = 'Trainer',
    gender,
    username,
    techanics,
    dateOfBirth,
    height,
    weight,
    description,
  } = req.body;
  try {
    await createTrainerService({
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
    });
    res.status(200).send({ message: 'Successfully Created' });
  } catch (error) {
    next(error);
  }
};
exports.getUserController = async (req, res, next) => {
  try {
    const {
      userType,
      search,
      page = '1',
      limit = '10',
      sortColumn = 'createdDate',
      sortDirection = 'desc',
    } = req.query;
    let response = await getUserService({
      userType,
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
exports.updateUserController = async (req, res, next) => {
  let {
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
  } = { ...req.body, ...req.params };
  try {
    // var imagepath = path.join(__dirname, '../public/uploads/profileImage/');
    // const host = req.headers.host;
    // const imageType =
    //   req.file && req.file.mimetype === 'image/png'
    //     ? '.png'
    //     : req.file && req.file.mimetype === '.jpg'
    //     ? '.jpg'
    //     : '.jpeg';
    // const imageName = req.file
    //   ? req.uploadfilename.split('.blob')[0] + imageType
    //   : '';
    // image = req.file
    //   ? req.protocol +
    //     '://' +
    //     host +
    //     '/public/uploads/profileImage/' +
    //     imageName
    //   : '';
    // if (req.file) {
    //   let profileImage = await Jimp.read(imagepath + req.uploadfilename);
    //   await profileImage.write(imagepath + imageName);
    //   fs.unlinkSync(imagepath + req.uploadfilename);
    // }
    emergencyContact = JSON.parse(emergencyContact);
    medicalCheckup = JSON.parse(medicalCheckup);
    await updateUserService({
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
    });
    res.status(200).send({ message: 'Successfully Updated' });
  } catch (error) {
    next(error);
  }
};
// exports.detailUserController = async (req, res, next) => {
//   const { userId } = req.params;
//   try {
//     let response = await detailUserService({
//       userId,
//     });
//     res.status(200).json(response);
//   } catch (error) {
//     next(error);
//   }
// };
// exports.deleteUserController = async (req, res, next) => {
//   const { userId } = req.params;
//   try {
//     await deleteUserService({
//       userId,
//     });
//     res.status(200).send({ message: 'Successfully Deleted' });
//   } catch (error) {
//     next(error);
//   }
// };
// exports.createStudentController = async (req, res, next) => {
//   let {
//     username,
//     email,
//     gender,
//     dateOfBirth,
//     image,
//     year,
//     parent,
//     password = 'kmax_student123',
//     paymentInfo,
//   } = req.body;
//   try {
//     var imagepath = path.join(__dirname, '../public/uploads/profileImage/');
//     const host = req.headers.host;
//     const imageType =
//       req.file && req.file.mimetype === 'image/png'
//         ? '.png'
//         : req.file && req.file.mimetype === '.jpg'
//         ? '.jpg'
//         : '.jpeg';
//     const imageName = req.file
//       ? req.uploadfilename.split('.blob')[0] + imageType
//       : '';
//     image = req.file
//       ? req.protocol +
//         '://' +
//         host +
//         '/public/uploads/profileImage/' +
//         imageName
//       : '';
//     if (req.file) {
//       let profileImage = await Jimp.read(imagepath + req.uploadfilename);
//       await profileImage.write(imagepath + imageName);
//       fs.unlinkSync(imagepath + req.uploadfilename);
//     }
//     console.log(paymentInfo);
//     paymentInfo = paymentInfo ? JSON.parse(paymentInfo) : {};
//     const response = await createStudentService({
//       username,
//       email,
//       gender,
//       dateOfBirth,
//       image,
//       year,
//       parent,
//       password,
//       paymentInfo,
//     });
//     res.status(200).send({ response });
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };
exports.loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    const response = await loginService({ email, password });
    res.json(response);
  } catch (error) {
    next(error);
  }
};

exports.getUserHomeController = async (req, res, next) => {
  try {
    const { userId } = req.headers;
    let response = await getUserHomeService({ userId });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
// exports.getAdminHomePaymentInfoController = async (req, res, next) => {
//   try {
//     const {
//       page = '1',
//       limit = '10',
//       sortColumn = 'payDate',
//       sortDirection = 'desc',
//       userType,
//     } = { ...req.headers, ...req.query };
//     if (userType == 'Admin' || userType == 'Student Affair') {
//       let response = await getAdminHomePaymentInfoService({
//         page,
//         limit,
//         sortColumn,
//         sortDirection,
//       });
//       res.status(200).json(response);
//     } else {
//       let error = new Error('You do not have permission');
//       error.status = 400;
//       throw error;
//     }
//   } catch (error) {
//     next(error);
//   }
// };
// exports.getTeacherAssementsController = async (req, res, next) => {
//   try {
//     const {
//       search = '',
//       page = '1',
//       limit = '10',
//       sortColumn = 'payDate',
//       sortDirection = 'desc',
//     } = { ...req.headers, ...req.query };
//     let response = await getTeacherAssements({
//       search,
//       page,
//       limit,
//       sortColumn,
//       sortDirection,
//     });
//     res.status(200).json(response);
//   } catch (error) {
//     next(error);
//   }
// };
// exports.getTeacherAssementScoresController = async (req, res, next) => {
//   try {
//     const {
//       search = '',
//       page = '1',
//       limit = '10',
//       sortColumn = 'className',
//       sortDirection = 'desc',
//     } = { ...req.headers, ...req.query };
//     let response = await getTeacherAssementScoresService({
//       search,
//       page,
//       limit,
//       sortColumn,
//       sortDirection,
//     });
//     res.status(200).json(response);
//   } catch (error) {
//     next(error);
//   }
// };
// exports.getTeacherTimelineController = async (req, res, next) => {
//   try {
//     const { userType } = req.headers;
//     if (userType == 'Admin' || userType == 'Student Affair') {
//       const response = await getTeacherTimelineSevice();
//       res.json(response);
//     } else {
//       let noPermission = new Error(`You don't have permission`);
//       noPermission.status = 400;
//       throw noPermission;
//     }
//   } catch (error) {
//     next(error);
//   }
// };
// exports.updateStudentController = async (req, res, next) => {
//   let {
//     username,
//     email,
//     role = 'Student',
//     gender,
//     dateOfBirth,
//     image,
//     address,
//     relationship,
//     phoneNumber,
//     studentId,
//     password,
//     position,
//     startDate,
//     education,
//     emergencyContact,
//     year,
//     parent,
//     paymentInfo,
//     students = '',
//   } = { ...req.body, ...req.params };
//   try {
//     var imagepath = path.join(__dirname, '../public/uploads/profileImage/');
//     const host = req.headers.host;
//     const imageType =
//       req.file && req.file.mimetype === 'image/png'
//         ? '.png'
//         : req.file && req.file.mimetype === '.jpg'
//         ? '.jpg'
//         : '.jpeg';
//     const imageName = req.file
//       ? req.uploadfilename.split('.blob')[0] + imageType
//       : '';
//     image = req.file
//       ? req.protocol +
//         '://' +
//         host +
//         '/public/uploads/profileImage/' +
//         imageName
//       : '';
//     if (req.file) {
//       let profileImage = await Jimp.read(imagepath + req.uploadfilename);
//       await profileImage.write(imagepath + imageName);
//       fs.unlinkSync(imagepath + req.uploadfilename);
//     }
//     await updateUserService({
//       username,
//       email,
//       role,
//       gender,
//       dateOfBirth,
//       image,
//       address,
//       relationship,
//       phoneNumber,
//       userId: studentId,
//       password,
//       position,
//       startDate,
//       education,
//       emergencyContact,
//       students,
//       year,
//       parent,
//       paymentInfo,
//     });
//     res.status(200).send({ message: 'Successfully Updated' });
//   } catch (error) {
//     next(error);
//   }
// };
exports.createAdminController = async (req, res, next) => {
  let {
    email,
    password,
    userType = 'Admin',
    gender,
    username,
    dateOfBirth,
    address,
  } = req.body;
  try {
    var imagepath = path.join(__dirname, '../public/uploads/profileImage/');
    const host = req.headers.host;
    const imageType =
      req.file && req.file.mimetype === 'image/png'
        ? '.png'
        : req.file && req.file.mimetype === '.jpg'
        ? '.jpg'
        : '.jpeg';
    const imageName = req.file
      ? req.uploadfilename.split('.blob')[0] + imageType
      : '';
    image = req.file
      ? req.protocol +
        '://' +
        host +
        '/public/uploads/profileImage/' +
        imageName
      : '';
    if (req.file) {
      let profileImage = await Jimp.read(imagepath + req.uploadfilename);
      await profileImage.write(imagepath + imageName);
      fs.unlinkSync(imagepath + req.uploadfilename);
    }
    const response = await createAdminService({
      email,
      password,
      userType,
      gender,
      username,
      dateOfBirth,
      address,
      image,
    });
    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

exports.updateAdminController = async (req, res, next) => {
  let {
    email,
    password,
    userType = 'Admin',
    gender,
    username,
    dateOfBirth,
    address,
    adminId,
  } = { ...req.body, ...req.params };
  try {
    var imagepath = path.join(__dirname, '../public/uploads/profileImage/');
    const host = req.headers.host;
    const imageType =
      req.file && req.file.mimetype === 'image/png'
        ? '.png'
        : req.file && req.file.mimetype === '.jpg'
        ? '.jpg'
        : '.jpeg';
    const imageName = req.file
      ? req.uploadfilename.split('.blob')[0] + imageType
      : '';
    image = req.file
      ? req.protocol +
        '://' +
        host +
        '/public/uploads/profileImage/' +
        imageName
      : '';
    if (req.file) {
      let profileImage = await Jimp.read(imagepath + req.uploadfilename);
      await profileImage.write(imagepath + imageName);
      fs.unlinkSync(imagepath + req.uploadfilename);
    }
    await updateAdminService({
      email,
      password,
      userType,
      gender,
      username,
      dateOfBirth,
      address,
      image,
      adminId,
    });
    res.status(200).send({ message: 'Successfully Updated' });
  } catch (error) {
    next(error);
  }
};
exports.detailAdminController = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const response = await detailUserService({ userId: adminId });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
exports.deleteUserController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const response = await deleteUserService({ userId });
    res.json(response);
  } catch (error) {
    next(errro);
  }
};
exports.getBookingHistroyController = async (req, res, next) => {
  try {
    const { userId, userType } = req.headers;
    const response = await getBookingHistroyService({ userId, userType });
    res.json(response);
  } catch (error) {
    next(errro);
  }
};

exports.saveFirebaseTokenController = async (req, res, next) => {
  try {
    const { userId } = req.headers;
    const { firebaseToken } = req.body;
    const response = await saveFirebaseTokenService({ userId, firebaseToken });
    res.json(response);
  } catch (error) {
    next(errro);
  }
};
exports.getNotificationController = async (req, res, next) => {
  try {
    const { userId } = req.headers;
    const response = await getNotificationService({ userId });
    res.json(response);
  } catch (error) {
    next(errro);
  }
};
exports.updateTrainerLocationController = async (req, res, next) => {
  try {
    const { userId, userType } = req.headers;
    const { latitude, longitude } = req.body;
    const response = await updateTrainerLocationService({
      userId,
      latitude,
      longitude,
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
exports.getTrainerLocationController = async (req, res, next) => {
  try {
    const { trainerId } = req.params;
    const response = await getTrainerLocationService({
      trainerId,
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
exports.addNewAddressController = async (req, res, next) => {
  try {
    const { userId, userType } = req.headers;
    const { newAddress } = req.body;
    const response = await addNewAddressService({
      userId,
      userType,
      newAddress,
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
