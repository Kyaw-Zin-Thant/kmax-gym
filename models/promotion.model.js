const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;
const schema = {
  name: String,
  bannerImage: String,
  startDate: String,
  endDate: String,
};
const PromotionSchema = new Schema(schema, {
  timestamps: {
    createdAt: 'createdDate',
    updatedAt: 'updatedDate',
  },
});

module.exports = mongoose.model('PROMOTION', PromotionSchema);
