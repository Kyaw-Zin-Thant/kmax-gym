const mongoose = require('mongoose');
const { Schema } = mongoose;
const schema = {
  type: String,
  name: String,
  image: String,
  calorie: String,
};
const DietPlanSchema = new Schema(schema, {
  timestamps: {
    createdAt: 'createdDate',
    updatedAt: 'updatedDate',
  },
});

module.exports = mongoose.model('DIET_PLAN', DietPlanSchema);
