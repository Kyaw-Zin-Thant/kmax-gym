const mongoose = require('mongoose');
const { Schema } = mongoose;
const schema = {
  name: String,
};
const YearSchema = new Schema(schema);
module.exports = mongoose.model('YEAR', YearSchema);
