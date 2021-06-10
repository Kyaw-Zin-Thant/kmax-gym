const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;
const schema = {
  userId: ObjectId,
  techanics: String,
  trainingTime: Date,
  amount: Number,
  dietPlan: [
    {
      name: String,
      image: String,
    },
  ],
  trainerId: ObjectId,
  metadata: {
    arrivedTime: Date,
    startTime: Date,
    finishTime: Date,
  },
};
const UserTrainingHistorySchema = new Schema(schema, {
  timestamps: {
    createdAt: 'createdDate',
    updatedAt: 'updatedDate',
  },
});

module.exports = mongoose.model(
  'USER_TRAINING_HISTORY',
  UserTrainingHistorySchema
);
