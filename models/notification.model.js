const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;
const schema = {
  to: ObjectId,
  title: String,
  body: String,
  type: {
    type: String,
    enum: ['booking', 'payment'],
    default: 'booking',
  }, //booking,payment
};
const NotificationSchema = new Schema(schema, {
  timestamps: {
    createdAt: 'createdDate',
    updatedAt: 'updatedDate',
  },
});

module.exports = mongoose.model('NOTIFICATION', NotificationSchema);
