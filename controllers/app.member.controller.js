const {
  updatMemberInfoService,
  updateMemberBodyInfoService,
  memberDetailInfoService,
  bookingService,
  getMemberWeightNoteServices,
  reviewAndRatingServices,
  cancelBookingServices,
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
    console.log(req.body);
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
    const {
      trainerId,
      startDate,
      selectedTime,
      techanics,
      count,
      relative = [],
    } = req.body;
    const response = await bookingService({
      userId,
      trainerId,
      startDate,
      selectedTime,
      techanics,
      count,
      relative,
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
exports.getMemberWeightNoteController = async (req, res, next) => {
  try {
    const { userId } = req.headers;
    const response = await getMemberWeightNoteServices({ userId });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
exports.reviewAndRatingController = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { review, rating } = req.body;
    const response = await reviewAndRatingServices({
      bookingId,
      review,
      rating,
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
};

exports.cancelBookingController = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const response = await cancelBookingServices({
      bookingId,
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
