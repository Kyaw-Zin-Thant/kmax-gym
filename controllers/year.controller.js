const {
  createYearService,
  getYearService,
  detailYearService,
  updateYearService,
  deleteYearService,
} = require('../services/year.service');
exports.createYearController = async (req, res, next) => {
  const { name } = req.body;
  try {
    await createYearService({
      name,
    });
    res.status(200).send({ message: 'Successfully Created' });
  } catch (error) {
    next(error);
  }
};
exports.getYearController = async (req, res, next) => {
  try {
    let response = await getYearService();
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
exports.detailYearController = async (req, res, next) => {
  try {
    const { yearId } = req.params;
    let response = await detailYearService({ yearId });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
exports.updateYearController = async (req, res, next) => {
  try {
    const { yearId, name } = { ...req.params, ...req.body };
    let response = await updateYearService({ yearId, name });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
exports.deleteYearController = async (req, res, next) => {
  try {
    const { yearId } = req.params;
    let response = await deleteYearService({ yearId });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
