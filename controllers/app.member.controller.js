const {
  updatMemberInfoService,
  updateMemberBodyInfoService,
  memberDetailInfoService,
  bookingService,
} = require('../services/app.member.service');
/**
 * After acc sign up update user info
 */
exports.updatMemberInfoController = async (req, res, next) => {
  try {
    const {
      username = '',
      gender = '',
      dateOfBirth = '',
      phoneNumber = '',
      address = '',
      emergencyContact = '',
      medicalCheckUp = '',
      memberId,
    } = { ...req.body, ...req.params };
    const response = await updatMemberInfoService({
      username,
      gender,
      dateOfBirth,
      phoneNumber,
      address,
      emergencyContact,
      medicalCheckUp,
      memberId,
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
};

exports.updateMemberBodyInfo = async (req, res, next) => {
  try {
    let updateBody = {};
    const { height, weight, memberId } = { ...req.body, ...req.params };
    updateBody.height = height;
    updateBody.weight = weight;
    for (const file of req.files) {
      const host = req.headers.host;
      const imageName = file.uploadfilename;
      file.originalname.includes('fullbody')
        ? (updateBody.wholeBody =
            req.protocol +
            '://' +
            host +
            '/public/uploads/bodyInfo/' +
            imageName)
        : file.originalname.includes('lowerbody')
        ? (updateBody.lowerBody =
            req.protocol +
            '://' +
            host +
            '/public/uploads/bodyInfo/' +
            imageName)
        : file.originalname.includes('upperbody')
        ? (updateBody.upperBody =
            req.protocol +
            '://' +
            host +
            '/public/uploads/bodyInfo/' +
            imageName)
        : '';
    }

    const response = await updateMemberBodyInfoService({
      updateBody,
      memberId,
    });
    res.json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
/**
 * member info
 */
exports.memberDetailInfoController = async (req, res, next) => {
  try {
    const { userId } = req.headers;
    const response = await memberDetailInfoService({ userId });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
exports.bookingController = async (req, res, next) => {
  try {
    const { userId } = req.headers;
    const { trainerId, startDate, startTime, endTime, techanics, count } =
      req.body;
    const response = await bookingService({
      userId,
      trainerId,
      startDate,
      startTime,
      endTime,
      techanics,
      count,
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
