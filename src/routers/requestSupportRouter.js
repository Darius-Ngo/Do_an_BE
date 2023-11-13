const requestSupportController = require("../controllers/requestSupportController");

const router = require("express").Router();

router.post("/getListRequest", requestSupportController.getListRequest);
router.post("/addRequest", requestSupportController.addRequest);
router.post("/updateStatus", requestSupportController.updateStatus);
router.post("/updateRequest", requestSupportController.updateRequest);
router.delete("/deleteRequest", requestSupportController.deleteRequest);

module.exports = router;
