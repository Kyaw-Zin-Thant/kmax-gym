const Year = require('../models/year.model');
exports.createYearService = async ({ name }) => {
  try {
    const year = new Year({ name });
    await year.save();
    return { message: '' };
  } catch (error) {
    throw error;
  }
};
exports.getYearService = async () => {
  try {
    const years = await Year.find({}, { _id: 0, yearId: '$_id', name: 1 });
    return { years };
  } catch (error) {
    throw error;
  }
};
exports.detailYearService = async ({ yearId }) => {
  try {
    const year = await Year.findById(yearId);
    return { yearId, name: year.name };
  } catch (error) {
    throw error;
  }
};
exports.updateYearService = async ({ yearId, name }) => {
  try {
    await Year.findByIdAndUpdate(yearId, { name });
    return { message: 'Successfully Updated' };
  } catch (error) {
    throw error;
  }
};
exports.deleteYearService = async ({ yearId }) => {
  try {
    await Year.findByIdAndRemove(yearId);
    return { message: 'Successfully Updated' };
  } catch (error) {
    throw error;
  }
};
