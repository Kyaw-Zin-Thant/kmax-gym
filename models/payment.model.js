const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;
const schema = {
  createdUser: ObjectId,
  amount: Number,
  currency: String,
  payUserId: ObjectId,
  payDate: {
    type: Date,
  },
  accountId: ObjectId,
  description: String,
  paytype: String,
  status: String,
  payAccount: String,
  payAccountType: String,
  feeId: ObjectId,
};
const PaymentSchema = new Schema(schema, {
  timestamps: {
    createdAt: 'createdDate',
    updatedAt: 'updatedDate',
  },
});

module.exports = mongoose.model('PAYMENT', PaymentSchema);
