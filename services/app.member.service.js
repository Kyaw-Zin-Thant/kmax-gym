const User = require('../models/user.model');

exports.updatMemberInfoService = async ({
  username,
  gender,
  dateOfBirth,
  phoneNumber,
  address,
  emergencyContact,
  medicalCheckUp,
  memberId,
}) => {
  try {
    let updateData = {};
    username ? (updateData.username = username) : '';
    gender ? (updateData.gender = gender) : '';
    dateOfBirth ? (updateData.dateOfBirth = dateOfBirth) : '';
    phoneNumber ? (updateData.phoneNumber = phoneNumber) : '';
    address ? (updateData.address = address) : '';
    emergencyContact ? (updateData.emergencyContact = emergencyContact) : '';
    medicalCheckUp ? (updateData.medicalCheckUp = medicalCheckUp) : '';
    await User.findByIdAndUpdate(memberId, updateData);
    return { message: 'Successfully Updated', memberId };
  } catch (error) {
    throw error;
  }
};

/**
 *
 * @param {*}  update Member Body InfoService
 * @returns
 */
exports.updateMemberBodyInfoService = async ({ updateBody, memberId }) => {
  try {
    await User.findByIdAndUpdate(memberId, updateBody);
    return { message: 'Successfully Updated', memberId };
  } catch (error) {
    throw error;
  }
};
