const tagsController = require("../controllers/tagsController");

const router = require("express").Router();

router.post("/getListTags", tagsController.getListTags);
router.get("/getListCombobox", tagsController.getListCombobox);
router.post("/addTags", tagsController.addTags);
router.put("/updateTags", tagsController.updateTags);
router.delete("/deleteTags", tagsController.deleteTags);
router.post("/changeStatus", tagsController.changeStatus);

module.exports = router;
