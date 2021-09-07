const {
  creatPromotionService,
  updatePromotionService,
  deletePromotionService,
  getPromotionService,
  detailPromotionService,
} = require('../services/promotion.service');
/**
 * creatPromotionController
 */
exports.createPromotionController = async (req, res, next) => {
  try {
    const { name, startDate, endDate } = req.body;
    const host = req.headers.host;
    const bannerFile = req.file;
    const bannerImage = bannerFile
      ? req.protocol +
        '://' +
        host +
        '/public/uploads/bannerImage/' +
        req.uploadfilename
      : '';
    const response = await creatPromotionService({
      name,
      startDate,
      endDate,
      bannerImage,
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
exports.updatePromotionController = async (req, res, next) => {
  try {
    const { name, startDate, endDate, promotionId } = {
      ...req.body,
      ...req.params,
    };
    const host = req.headers.host;
    const bannerFile = req.file;
    const bannerImage = bannerFile
      ? req.protocol +
        '://' +
        host +
        '/public/uploads/bannerImage/' +
        req.uploadfilename
      : '';
    const response = await updatePromotionService({
      name,
      startDate,
      endDate,
      promotionId,
      bannerImage,
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
exports.deletePromotionController = async (req, res, next) => {
  try {
    const { promotionId } = req.params;
    const response = await deletePromotionService({ promotionId });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
exports.detailPromotionController = async (req, res, next) => {
  try {
    const { promotionId } = req.params;
    const response = await detailPromotionService({ promotionId });
    res.json(response);
  } catch (error) {
    next(error);
  }
};
exports.getPromotionController = async (req, res, next) => {
  try {
    const {
      search,
      page = '1',
      limit = '10',
      sortColumn = 'createdDate',
      sortDirection = 'desc',
    } = req.query;
    let response = await getPromotionService({
      search,
      page,
      limit,
      sortColumn,
      sortDirection,
    });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
