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
    console.log(updateData);
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
      let {
        username,
        dateOfBirth,
        weight,
        height,
        gender,
        image,
        phoneNumber,
        address,
        emergencyContact,
        medicalCheckUp,
      } = member;
      dateOfBirth = moment(new Date(dateOfBirth), 'DD-MM-YYYY');
      let bmi, realweight, realheight;
      realweight = weight.split(' ');
      realheight = height.split(' ');
      realweight = realweight[1] == 'kg' ? realweight[0] * 2.2 : realweight[0];
      realheight =
        realheight[1] == 'cm' ? realheight[0] * 0.03 : realheight[0] * 12;
      bmi = calcBmi(realweight, realheight, true);
      bmi.value = bmi.value.toFixed(2);
      const { heartDisease, kneePain, backPain, broken, surgery, other } =
        medicalCheckUp;
      console.log(medicalCheckUp);
      return {
        username,
        dateOfBirth,
        weight,
        height,
        gender,
        bmi,
        image,
        userId,
        emerName: emergencyContact ? emergencyContact.name : '',
        emerPhone: emergencyContact ? emergencyContact.phoneNumber : '',
        heartDisease,
        phoneNumber,
        address,
        kneePain,
        backPain,
        broken,
        surgery,
        other,
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
