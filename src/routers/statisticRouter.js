const statisticController = require("../controllers/statisticController");

const router = require("express").Router();

router.post("/getStatisticOrder", statisticController.getStatisticOrder);
router.post(
  "/getStatisticProductTrend",
  statisticController.getStatisticProductTrend
);
router.post(
  "/getStatisticByCategory",
  statisticController.getStatisticByCategory
);

module.exports = router;
