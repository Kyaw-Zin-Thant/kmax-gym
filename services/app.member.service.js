const User = require('../models/user.model');
const moment = require('moment');
var calcBmi = require('bmi-calc');
const UserBooking = require('../models/user.booking.trainer.model');
exports.updatMemberInfoService = async ({
  username,
  gender,
  dateOfBirth,
  phoneNumber,
  address,
  emergencyContact,
  medicalCheckUp,
  memberId,
}) => {
  try {
    let updateData = {};
    username ? (updateData.username = username) : '';
    gender ? (updateData.gender = gender) : '';
    dateOfBirth ? (updateData.dateOfBirth = dateOfBirth) : '';
    phoneNumber ? (updateData.phoneNumber = phoneNumber) : '';
    address ? (updateData.address = address) : '';
    emergencyContact ? (updateData.emergencyContact = emergencyContact) : '';
    medicalCheckUp ? (updateData.medicalCheckUp = medicalCheckUp) : '';
    await User.findByIdAndUpdate(memberId, updateData);
    return { message: 'Successfully Updated', memberId };
  } catch (error) {
    throw error;
  }
};

/**
 *
 * @param {*}  update Member Body InfoService
 * @returns
 */
exports.updateMemberBodyInfoService = async ({ updateBody, memberId }) => {
  try {
    await User.findByIdAndUpdate(memberId, updateBody);
    return { message: 'Successfully Updated', memberId };
  } catch (error) {
    throw error;
  }
};
/**
 * member detail
 */
exports.memberDetailInfoService = async ({ userId }) => {
  try {
    const member = await User.findById(userId);
    if (member) {
      let { username, dateOfBirth, weight, height, gender } = member;
      console.log(dateOfBirth);
      dateOfBirth = moment(dateOfBirth, 'DD-MM-YYYY');
      let bmi, realweight, realheight;
      realweight = weight.split(' ');
      realheight = height.split(' ');
      realweight = realweight[1] == 'kg' ? realweight[0] * 2.2 : realweight[0];
      realheight = realheight[1] == 'cm' ? realheight[0] * 0.03 : realheight[0];
      bmi = calcBmi(realweight, realheight, true);
      return {
        username,
        dateOfBirth,
        weight,
        height,
        gender,
        bmi,
        userId,
      };
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};
exports.bookingService = async ({
  userId,
  trainerId,
  startDate,
  startTime,
  endTime,
  techanics,
  count,
}) => {
  try {
    let formatDate = moment(startDate).format('YYYY-MM-DD');
    startDate = new Date(formatDate + ' ' + startTime);
    let endDate = new Date(formatDate + ' ' + endTime);
    let status = 'Pending';
    const booking = await new UserBooking({
      userId,
      trainerId,
      status,
      startTime: startDate,
      endTime: endDate,
      techanics,
      count,
    }).save();
    return { message: 'Successfully Booked', bookingId: booking._id };
  } catch (error) {
    throw error;
  }
};
