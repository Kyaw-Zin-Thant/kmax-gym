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
    ],
  },
  startTime: Date,
  endTime: Date,
  techanics: String,
  count: Number,
  suggestion: {
    burnCalorie: Number,
    dietPlans: [ObjectId],
  },
};
const UserApplyTrainerSchema = new Schema(schema, {
  timestamps: {
    createdAt: 'createdDate',
    updatedAt: 'updatedDate',
  },
});

module.exports = mongoose.model('USER_BOOKING_TRAINER', UserApplyTrainerSchema);
