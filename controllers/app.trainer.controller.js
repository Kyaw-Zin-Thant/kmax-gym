const { getTrainerDetailService } = require('../services/app.trainer.service');
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
