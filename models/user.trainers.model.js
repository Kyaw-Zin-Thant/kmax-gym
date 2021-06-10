const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;
const schema = {
  userId: ObjectId,
  trainers: [
    {
      userId: ObjectId,
      trainingTime: Date,
      techanics: String,
    },
  ],
};
const UserTrainerSchema = new Schema(schema, {
  timestamps: {
    createdAt: 'createdDate',
    updatedAt: 'updatedDate',
  },
});

module.exports = mongoose.model('USER_TRAINER', UserTrainerSchema);
