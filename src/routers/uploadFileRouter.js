const uploadFileController = require("../controllers/uploadFileController");

const router = require("express").Router();

router.post("/uploadFileImage", uploadFileController.uploadFile);

module.exports = router;
