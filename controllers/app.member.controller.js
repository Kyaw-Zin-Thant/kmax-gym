const {
  updatMemberInfoService,
  updateMemberBodyInfoService,
} = require('../services/app.member.service');
/**
 * After acc sign up update user info
 */
exports.updatMemberInfoController = async (req, res, next) => {
  try {
    const {
      username = '',
      gender = '',
      dateOfBirth = '',
      phoneNumber = '',
      address = '',
      emergencyContact = '',
      medicalCheckUp = '',
      memberId,
    } = { ...req.body, ...req.params };
    const response = await updatMemberInfoService({
      username,
      gender,
      dateOfBirth,
      phoneNumber,
      address,
      emergencyContact,
      medicalCheckUp,
      memberId,
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
};

exports.updateMemberBodyInfo = async (req, res, next) => {
  try {
    let updateBody = {};
    const { height, weight, memberId } = { ...req.body, ...req.params };
    updateBody.height = height;
    updateBody.weight = weight;
    for (const file of req.files) {
      const host = req.headers.host;
      const imageName = file.uploadfilename;
      file.originalname.includes('fullbody')
        ? (updateBody.wholeBody =
            req.protocol +
            '://' +
            host +
            '/public/uploads/bodyInfo/' +
            imageName)
        : file.originalname.includes('lowerbody')
        ? (updateBody.lowerBody =
            req.protocol +
            '://' +
            host +
            '/public/uploads/bodyInfo/' +
            imageName)
        : file.originalname.includes('upperbody')
        ? (updateBody.upperBody =
            req.protocol +
            '://' +
            host +
            '/public/uploads/bodyInfo/' +
            imageName)
        : '';
    }

    const response = await updateMemberBodyInfoService({
      updateBody,
      memberId,
    });
    res.json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
