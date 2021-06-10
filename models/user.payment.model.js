const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;
const schema = {
  userId: ObjectId,
  amount: {
    type: Number,
    default: 0,
  },
  payDate: {
    type: Date,
  },
};
const UserPaymentSchema = new Schema(schema, {
  timestamps: {
    createdAt: 'createdDate',
    updatedAt: 'updatedDate',
  },
});

module.exports = mongoose.model('USER_PAYMENT', UserPaymentSchema);
