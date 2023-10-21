const uploadFileController = require("../controllers/uploadFileController");

const router = require("express").Router();

router.post("/uploadFile", uploadFileController.uploadFile);
router.post("/uploadListFile", uploadFileController.uploadListFile);

module.exports = router;
