const regionController = require("../controllers/regionController");

const router = require("express").Router();

router.get("/getListProvince", regionController.getListProvince);
router.get("/getListDistrict", regionController.getListDistrict);
router.get("/getListWard", regionController.getListWard);

module.exports = router;
