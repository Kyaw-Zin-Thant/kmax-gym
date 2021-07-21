const mongoose = require('mongoose');
const { Schema } = mongoose;
const schema = {
  name: String,
  accNo: String,
  accountType: String,
  amount: Number,
  currency: String,
  fee: Boolean,
};
const AccountSchema = new Schema(schema, {
  timestamps: {
    createdAt: 'createdDate',
    updatedAt: 'updatedDate',
  },
});

module.exports = mongoose.model('ACCOUNT', AccountSchema);
