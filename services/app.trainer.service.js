const User = require('../models/user.model');
const TrainerBooking = require('../models/user.booking.trainer.model');
const UserHistory = require('../models/user.trainers.model');
var calcBmi = require('bmi-calc');
const moment = require('moment');
const mongoose = require('mongoose');
const DietPlan = require('../models/diet.plan.model');
const Notification = require('../models/notification.model');
const Payment = require('../models/payment.model');
const { SendFirebaseMessage } = require('./firebase.messaging.service');
// var FCM = require('fcm-node');
// var serverKey = require('./firebase_kmax.json');
// var fcm = new FCM(serverKey);
const { ObjectId } = mongoose.Types;
exports.getTrainerDetailService = async ({ trainerId }) => {
  try {
    const result = await Promise.all([
      User.findById(trainerId),
      Payment.find({ payUserId: ObjectId(trainerId) }),
      TrainerBooking.aggregate([
        {
          $match: {
            trainerId: ObjectId(trainerId),
          },
        },
        {
          $lookup: {
            from: 'users',
            let: { userId: '$userId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', '$$userId'],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  username: 1,
                  image: 1,
                },
              },
            ],
            as: 'member',
          },
        },
        {
          $unwind: {
            path: '$member',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            rating: 1,
            feedback: '$review',
            userName: '$member.username',
            date: '$updatedDate',
            imageUrl: '$member.image',
          },
        },
      ]),
    ]);
    const trainer = result[0];
    let wallet = result[1].map((val) => parseInt(val.amount));
    wallet = wallet.reduce((a, b) => a + b, 0);
    if (trainer) {
      let {
        username,
        dateOfBirth,
        weight = '0 lb',
        height = '0 ft',
        gender,
        certificate = [],
        experience,
        email,
        userType,
        techanics,
        description,
        image,
      } = trainer;

      dateOfBirth = moment(dateOfBirth, 'YYYY-MM-DD');
      let bmi, realweight, realheight;
      realweight = weight.split(' ');
      realheight = height.split(' ');
      realweight = realweight[1] == 'kg' ? realweight[0] * 2.2 : realweight[0];
      realheight =
        realheight[1] == 'cm' ? realheight[0] * 0.03 : realheight[0] * 12;
      bmi = calcBmi(realweight, realheight, true);
      bmi.value = bmi.value.toFixed(2);
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
        image,
        wallet: wallet + '',
        feedbackList: result[2],
      };
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};
exports.getTrainerBookingService = async ({ date, trainerId }) => {
  try {
    let findDate = new Date(date);
    const startTime = new Date(findDate.setHours(0, 0, 0, 0));
    const endTime = new Date(findDate.setHours(23, 59, 59, 59));
    let result = await TrainerBooking.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ['$trainerId', ObjectId(trainerId)] },
              { $gte: ['$startTime', startTime] },
              { $lte: ['$endTime', endTime] },
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { userId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$userId'],
                },
              },
            },
            {
              $project: {
                _id: 0,
                username: 1,
                phoneNumber: 1,
                image: 1,
                height: 1,
                weight: 1,
                medicalCheckUp: 1,
                address: 1,
                dateOfBirth: 1,
              },
            },
          ],
          as: 'member',
        },
      },
      {
        $unwind: {
          path: '$member',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          bookingId: '$_id',
          member: 1,
          status: 1,
          techanics: 1,
          startTime: 1,
          endTime: 1,
          weight_comparison: 1,
        },
      },
    ]);
    console.log(result, ' checking ');
    return result;
  } catch (error) {
    throw error;
  }
};
exports.bookingStatusUpdate = async ({ bookingId, status }) => {
  try {
    const booking = await TrainerBooking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    );
    const { userId, trainerId, startTime, endTime, techanics } = booking;
    let userbookingHis = await UserHistory.findOne({ userId });
    let user = await User.findById(userId);
    SendFirebaseMessage({
      data: {
        title: 'Your booking is ' + status,
        body:
          `Booking ${status} For ` +
          moment(startTime).format('dddd, MMMM Do YYYY'),
      },
      notification: {
        title: 'Your booking is ' + status,
        body:
          `Booking ${status} For ` +
          moment(startTime).format('dddd, MMMM Do YYYY'),
      },
      to:
        user.firebaseToken ||
        'eUcMfDyVQh-bnV5lyC6OFE:APA91bF2CxZL_5fGFj8IBy7z7aHAaPpNVjdeO_iF2vOHLvqP5NK8zDfeKc2PLHf4aW80elJ8eZaPig1FeK6kYRF3G9AiWBmpdWzSJtdOKcPgwodFlXP6oBL5yFo91oCiBVnOWQarstNY',
    });
    await new Notification({
      title: 'Your booking is ' + status,
      body:
        `Booking ${status} For ` +
        moment(startTime).format('dddd, MMMM Do YYYY'),
      to: user._id,
      type: 'booking',
    }).save();
    if (userbookingHis && status == 'Accept') {
      const trainers = [
        ...userbookingHis.trainers,
        {
          userId: trainerId,
          startTime,
          endTime,
          techanics,
          bookingId,
        },
      ];
      await UserHistory.findByIdAndUpdate(userbookingHis._id, { trainers });
    } else if (status == 'Accept') {
      userbookingHis = new UserHistory({
        userId,
        trainers: [
          {
            userId: trainerId,
            startTime,
            endTime,
            techanics,
            bookingId,
          },
        ],
      });
      await userbookingHis.save();
    }

    return { message: 'Successfully Updated' };
  } catch (error) {
    throw error;
  }
};
/**
 * updateTrainerProfileService
 */
exports.updateTrainerProfileService = async ({ userId, file }) => {
  try {
    await User.findByIdAndUpdate(userId, { image: file });
    return { message: 'Successfully Updated' };
  } catch (error) {
    throw error;
  }
};
exports.updateTrainerEduAndExpService = async ({
  userId,
  experience,
  certificate,
}) => {
  try {
    let updateData = {};
    experience
      ? (updateData = { experience })
      : certificate
      ? (updateData = { certificate })
      : '';
    await User.findByIdAndUpdate(userId, updateData);
    return { message: 'Successfully Updated' };
  } catch (error) {
    throw error;
  }
};
exports.getDietPlanService = async () => {
  try {
    const result = await DietPlan.find(
      {},
      { _id: 0, name: 1, image: 1, dietPlanId: '$_id', type: 1, calorie: 1 }
    );
    return result;
  } catch (error) {
    throw error;
  }
};

exports.suggestMemberService = async ({ calorie, dietPlans, bookingId }) => {
  try {
    await TrainerBooking.updateOne(
      { _id: ObjectId(bookingId) },
      {
        suggestion: {
          burnCalorie: calorie,
          dietPlans: dietPlans,
        },
      }
    );
    return { message: 'Success' };
  } catch (error) {
    throw error;
  }
};
exports.memberWeightNoteService = async ({
  weight,
  neck,
  chest,
  belly,
  ass,
  right_arm,
  left_arm,
  right_hand,
  left_hand,
  right_thigh,
  left_thigh,
  right_crural,
  left_crural,
  bookingId,
}) => {
  try {
    const booking = await TrainerBooking.findById(bookingId);
    console.log(booking);
    await Promise.all([
      TrainerBooking.updateOne(
        { _id: ObjectId(bookingId) },
        {
          $set: {
            weight_comparison: {
              weight,
              neck,
              chest,
              belly,
              ass,
              right_arm,
              left_arm,
              right_hand,
              left_hand,
              right_thigh,
              left_thigh,
              right_crural,
              left_crural,
            },
          },
        }
      ),
      User.updateOne(
        { _id: booking.userId },
        {
          $push: {
            weight_comparison: {
              weight,
              neck,
              chest,
              belly,
              ass,
              right_arm,
              left_arm,
              right_hand,
              left_hand,
              right_thigh,
              left_thigh,
              right_crural,
              left_crural,
            },
          },
        }
      ),
    ]);
    return { message: 'Successfully updated' };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
