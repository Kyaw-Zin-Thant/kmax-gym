const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;
const schema = {
  createdUser: ObjectId,
  amount: String,
  payDate: {
    type: Date,
  },
  paymentId: ObjectId,
  accountNo: String,
  accountType: String,
  description: String,
  paytype: String,
  status: String,
  payAccount: String,
  payAccountType: String,
};
const PaymentSchema = new Schema(schema, {
  timestamps: {
    createdAt: 'createdDate',
    updatedAt: 'updatedDate',
  },
});

module.exports = mongoose.model('PAYMENT', PaymentSchema);
