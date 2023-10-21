const rateController = require("../controllers/rateController");

const router = require("express").Router();

router.post("/rateOrder", rateController.rateOrder);
router.get("/getDetailDetail", rateController.getDetailDetail);

module.exports = router;
