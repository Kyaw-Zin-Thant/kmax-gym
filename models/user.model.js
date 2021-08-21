const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;
const schema = {
  username: String,
  email: {
    type: String,
    unique: true,
  },
  userType: {
    type: String,
    enum: ['Admin', 'Trainer', 'Member'],
  },
  gender: String,
  dateOfBirth: String,
  image: String,
  phoneNumber: String,
  address: String, //optional
  password: String,
  emergencyContact: {},
  experience: [
    {
      place: String,
      position: String,
      description: String,
      startDate: Date,
      endDate: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  certificate: [
    {
      name: String,
      year: String,
      description: String,
    },
  ],
  medicalCheckUp: {
    heartDisease: Boolean,
    kneePain: Boolean,
    backPain: Boolean,
    broken: Boolean,
    surgery: Boolean,
    other: String,
  },
  techanics: {
    type: String,
  },
  height: String,
  weight: String,
  wholeBody: String,
  upperBody: String,
  lowerBody: String,
  description: String,
  duty: {
    type: Boolean,
    default: null,
  },
  recommend: {
    type: Boolean,
    default: null,
  },
  trainerCode: String,
  muli_address: [String],
  firebaseToken: String,
  doneMemberInfo: Boolean,
  doneBodyInfo: Boolean,
  metadata: {
    latitude: String,
    longitude: String,
    noOfDay: String,
    status: String,
  },
  weight_comparison: [
    {
      weight: String,
      neck: String,
      chest: String,
      belly: String,
      ass: String,
      right_arm: String,
      left_arm: String,
      right_hand: String,
      left_hand: String,
      right_thigh: String,
      left_thigh: String,
      right_crural: String,
      left_crural: String,
      createDate: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
};
const UserSchema = new Schema(schema, {
  timestamps: {
    createdAt: 'createdDate',
    updatedAt: 'updatedDate',
  },
});

module.exports = mongoose.model('USER', UserSchema);
