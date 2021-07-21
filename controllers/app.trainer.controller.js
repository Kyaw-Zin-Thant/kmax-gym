const {
  getTrainerDetailService,
  getTrainerBookingService,
  bookingStatusUpdate,
  updateTrainerProfileService,
  getDietPlanService,
  suggestMemberService,
} = require('../services/app.trainer.service');
const { updateTrainerService } = require('../services/user.service');
exports.getTrainerDetailController = async (req, res, next) => {
  try {
    const { trainerId } = req.params;
    const response = await getTrainerDetailService({ trainerId });
    res.json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.updateTrainerController = async (req, res, next) => {
  let {
    email,
    userType = 'Trainer',
    gender,
    username,
    techanics,
    dateOfBirth,
    height,
    weight,
    description,
    trainerId,
  } = { ...req.body, ...req.params };
  try {
    await updateTrainerService({
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
    });
    res.status(200).send({ message: 'Successfully Created' });
  } catch (error) {
    next(error);
  }
};
/**
 * get trainer booking
 */
exports.getTrainerBookingController = async (req, res, next) => {
  try {
    const { date } = req.query;
    console.log(date, ' checking ');
    const { userId: trainerId } = req.headers;
    const response = await getTrainerBookingService({ date, trainerId });
    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};

/**
 * get trainer booking
 */
exports.bookingStatusUpdateController = async (req, res, next) => {
  try {
    const { bookingId, status } = req.params;
    const response = await bookingStatusUpdate({ bookingId, status });
    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
/**
 * trainer profile update
 */
exports.updateTrainerProfileController = async (req, res, next) => {
  try {
    console.log('in the profile tainer ', req.file);
    const host = req.headers.host;
    const file = req.file
      ? req.protocol +
        '://' +
        host +
        '/public/uploads/profileImage/' +
        req.file.uploadfilename
      : '';
    const { trainerId: userId } = req.params;
    console.log(file);
    const response = await updateTrainerProfileService({ userId, file });
    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
/**
 * get  diet plan
 */
exports.getDietPlanController = async (req, res, next) => {
  try {
    const response = await getDietPlanService();
    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};
/**
 * suggest member
 */
exports.suggestMemberController = async (req, res, next) => {
  try {
    const { calorie, dietPlans, bookingId } = { ...req.params, ...req.body };
    console.log(bookingId, ' dietPlans');
    const response = await suggestMemberService({
      calorie,
      dietPlans,
      bookingId,
    });
    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
};