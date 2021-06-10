const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;
const schema = {
  userId: ObjectId,
  trainerId: ObjectId,
  status: {
    type: String,
  },
  trainingTime: Date,
  techanics: String,
};
const UserApplyTrainerSchema = new Schema(schema, {
  timestamps: {
    createdAt: 'createdDate',
    updatedAt: 'updatedDate',
  },
});

module.exports = mongoose.model('USER_BOOKING_TRAINER', UserApplyTrainerSchema);
