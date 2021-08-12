const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;
const schema = {
  name: String,
  amount: Number,
  currency: String,
  noOfUser: Number,
  noOfDay: {
    type: String,
    default: '1',
  },
  description: String,
};
const FeeSchema = new Schema(schema, {
  timestamps: {
    createdAt: 'createdDate',
    updatedAt: 'updatedDate',
  },
});

module.exports = mongoose.model('FEE', FeeSchema);
