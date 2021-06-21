const User = require('../models/user.model');
var calcBmi = require('bmi-calc');
const moment = require('moment');
exports.getTrainerDetailService = async ({ trainerId }) => {
  try {
    const trainer = await User.findById(trainerId);
    if (trainer) {
      let {
        username,
        dateOfBirth,
        weight,
        height,
        gender,
        certificate = [],
        experience,
        email,
        userType,
        techanics,
        description,
      } = trainer;
      console.log(dateOfBirth);
      dateOfBirth = moment(dateOfBirth, 'DD-MM-YYYY');
      let bmi, realweight, realheight;
      realweight = weight.split(' ');
      realheight = height.split(' ');
      realweight = realweight[1] == 'kg' ? realweight[0] * 2.2 : realweight[0];
      realheight = realheight[1] == 'cm' ? realheight[0] * 0.03 : realheight[0];

      console.log(realweight, realheight, ' ', trainer);
      bmi = calcBmi(realweight, realheight, true);

      return {
        username,
        dateOfBirth,
        weight,
        height,
        gender,
        certificate,
        experience,
        bmi,
        trainerId,
        email,
        userType,
        techanics,
        description,
      };
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};
