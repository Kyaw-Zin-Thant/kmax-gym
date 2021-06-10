const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;
const schema = {
  userId: ObjectId,
  trainerId: ObjectId,
  star: Number,
  note: String,
  memberComplaint: String,
};
const TrainerReviewSchema = new Schema(schema, {
  timestamps: {
    createdAt: 'createdDate',
    updatedAt: 'updatedDate',
  },
});

module.exports = mongoose.model('TRAINER_REVIEW', TrainerReviewSchema);
