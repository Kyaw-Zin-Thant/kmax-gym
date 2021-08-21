const User = require('../models/user.model');
const moment = require('moment');
var calcBmi = require('bmi-calc');
const UserBooking = require('../models/user.booking.trainer.model');
const { SendFirebaseMessage } = require('./firebase.messaging.service');
const Notification = require('../models/notification.model');
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
    updateData.doneMemberInfo = true;
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
    updateBody.doneBodyInfo = true;
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
        muli_address,
        metadata = {},
      } = member;
      dateOfBirth = moment(new Date(dateOfBirth), 'DD-MM-YYYY');
      let bmi, realweight, realheight;
      realweight = weight ? weight.split(' ') : '0kg';
      realheight = height ? height.split(' ') : '0ft';
      realweight = realweight[1] == 'kg' ? realweight[0] * 2.2 : realweight[0];
      realheight =
        realheight[1] == 'cm' ? realheight[0] * 0.03 : realheight[0] * 12;
      bmi = calcBmi(realweight, realheight, true);
      bmi.value = bmi.value.toFixed(2);
      const { heartDisease, kneePain, backPain, broken, surgery, other } =
        medicalCheckUp;
      address ? muli_address.push(address) : '';
      console.log('user address ' + address);
      muli_address = [...new Set(muli_address)];
      const { noOfDay = '0' } = metadata;
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
        muli_address,
        noOfDay,
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
  selectedTime,
  techanics,
  count = 1,
  relative = [],
}) => {
  try {
    let formatDate = moment(startDate).format('YYYY-MM-DD');

    const startTime =
      selectedTime == 1
        ? '7:30 AM'
        : selectedTime == 2
        ? '12:00 PM'
        : '2:00 PM';
    const endTime =
      selectedTime == 1 ? '9:00 AM' : selectedTime == 2 ? '1:30 PM' : '3:30 PM';
    startDate = new Date(formatDate + ' ' + startTime);
    let endDate = new Date(formatDate + ' ' + endTime);
    let status = 'Pending';
    const userBooking = await new UserBooking({
      userId,
      trainerId,
      status,
      startTime: startDate,
      endTime: endDate,
      techanics,
      count,
      relative,
    });
    const result = await Promise.all([
      userBooking.save(),
      User.findById(trainerId),
      User.findById(userId),
      new Notification({
        title: 'Your have a booking',
        body:
          `Booking For ` +
          moment(startDate).format('dddd, MMMM Do YYYY') +
          ` ${startTime} ${endTime}`,
        to: trainerId,
        type: 'booking',
      }).save(),
    ]);
    SendFirebaseMessage({
      data: {
        title: 'Your have a booking from Member ' + result[2].username,
        body:
          `Booking For ` +
          moment(startDate).format('dddd, MMMM Do YYYY') +
          ` ${startTime} ${endTime}`,
      },
      notification: {
        title: 'Your have a booking from Member ' + result[2].username,
        body:
          `Booking For ` +
          moment(startDate).format('dddd, MMMM Do YYYY') +
          ` ${startTime} ${endTime}`,
      },
      // priority: 'normal',
      to: result[1].firebaseToken || '',
    });
    const noOfDay = parseInt(result[2].metadata.noOfDay) - 1;

    await User.findByIdAndUpdate(userId, {
      $set: { 'metadata.noOfDay': noOfDay },
    });
    return { message: 'Successfully Booked', bookingId: result[0]._id };
  } catch (error) {
    throw error;
  }
};
exports.getMemberWeightNoteServices = async ({ userId }) => {
  try {
    const user = await User.findById(userId);
    const { weight_comparison = [] } = user;
    return { weight_comparison };
  } catch (error) {
    throw error;
  }
};
exports.reviewAndRatingServices = async ({ bookingId, review, rating }) => {
  try {
    await UserBooking.findByIdAndUpdate(bookingId, {
      $set: { review, rating },
    });
    return { message: 'Successfully Updated' };
  } catch (error) {
    throw error;
  }
};
