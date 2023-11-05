const rateController = require("../controllers/rateController");

const router = require("express").Router();

router.post("/rateOrder", rateController.rateOrder);
router.get("/getDetailRate", rateController.getDetailRate);
router.get("/getRateProduct", rateController.getRateProduct);
router.post("/getListRatingProduct", rateController.getListRatingProduct);

module.exports = router;
