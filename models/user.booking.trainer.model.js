const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;
const schema = {
  userId: ObjectId,
  trainerId: ObjectId,
  status: {
    type: String,
    enum: [
      'Pending',
      'Accept',
      'Reject',
      'Finish Training',
      'Start Training',
      'Coming',
      'Arrived',
      'Canceled',
    ],
  },
  relative: [ObjectId],
  startTime: Date,
  endTime: Date,
  techanics: String,
  count: Number,
  suggestion: {
    burnCalorie: Number,
    dietPlans: [ObjectId],
  },
  weight_comparison: {
    weight: String,
    neck: String,
    chest: String,
    belly: String,
    ass: String,
    right_arm: String,
    left_arm: String,
    right_hand: String,
    left_hand: String,
    right_thigh: String,
    left_thigh: String,
    right_crural: String,
    left_crural: String,
  },
  review: String,
  rating: Number,
};
const UserApplyTrainerSchema = new Schema(schema, {
  timestamps: {
    createdAt: 'createdDate',
    updatedAt: 'updatedDate',
  },
});

module.exports = mongoose.model('USER_BOOKING_TRAINER', UserApplyTrainerSchema);
