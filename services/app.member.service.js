const User = require('../models/user.model');
const moment = require('moment');
var calcBmi = require('bmi-calc');
const UserBooking = require('../models/user.booking.trainer.model');
const { SendFirebaseMessage } = require('./firebase.messaging.service');
const Notification = require('../models/notification.model');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
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
    startDate = new Date(formatDate + ' ' + startTime + ' GMT+0630');
    let endDate = new Date(formatDate + ' ' + endTime + ' GMT+0630');
    let status = 'Pending';
    const checkOld = await UserBooking.findOne({
      trainerId: ObjectId(trainerId),
      startTime: startDate,
      status: { $ne: 'Reject' },
    });
    if (checkOld) {
      const Alerror = new Error('Your Trainer is already booked');
      Alerror.status = 400;
      throw Alerror;
    } else {
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
      ]);
      await new Notification({
        title: 'You have a booking from Member ' + result[2].username,
        body:
          `Booking For ` +
          moment(startDate).format('dddd, MMMM Do YYYY') +
          ` ${startTime} ${endTime}`,
        to: trainerId,
        type: 'booking',
      }).save(),
        SendFirebaseMessage({
          data: {
            title: 'You have a booking from Member ' + result[2].username,
            body:
              `Booking For ` +
              moment(startDate).format('dddd, MMMM Do YYYY') +
              ` ${startTime} ${endTime}`,
          },
          notification: {
            title: 'You have a booking from Member ' + result[2].username,
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
    }
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
exports.cancelBookingServices = async ({ bookingId }) => {
  try {
    const booking = await UserBooking.findById(bookingId);
    const hours = Math.floor(Math.abs(booking.startTime - new Date()) / 36e5);
    const user = await User.findById(booking.userId);
    if (hours > 8) {
      let result = await Promise.all([
        UserBooking.findByIdAndUpdate(booking._id, { status: 'Canceled' }),
        User.findById(booking.trainerId),
      ]);
      let trainer = result[1];
      const trainerName = user.username;

      const notiTime = moment(startTime).format('dddd, MMMM Do YYYY');
      const noOfDay =
        user.metadata && user.metadata.noOfDay
          ? parseInt(user.metadata.noOfDay) + 1
          : 1;
      await User.findByIdAndUpdate(user._id, {
        $set: { 'metadata.noOfDay': noOfDay },
      });
      SendFirebaseMessage({
        data: {
          title: 'Your booking have been canceled ',
          body: `Your booking have been canceled at ${notiTime} by Member  ${trainerName} `,
        },
        notification: {
          title: 'Your booking have been canceled ',
          body: `Your booking have been canceled at ${notiTime} by Member  ${trainerName} `,
        },
        to: trainer.firebaseToken,
      });
      await new Notification({
        title: 'Your booking have been canceled ',
        body: `Your booking have been canceled at ${notiTime} by Member  ${trainerName} `,
        to: trainer._id,
        type: 'booking',
      }).save();
      return { message: 'Successfully Cancel Your Booking' };
    } else {
      let error = new Error('၈ နာရီမတိုင်ခင် ဘဲ cancel လုပ်နိုင်မည်');
      error.status = 400;
      throw error;
    }
  } catch (error) {
    throw error;
  }
};
