const categoryController = require("../controllers/categoryController");

const router = require("express").Router();

router.post("/getListCategory", categoryController.getListCategory);
router.post("/exportExcel", categoryController.exportExcel);
router.get("/getDetailCategory/:id", categoryController.getDetailCategory);
router.post("/addCategory", categoryController.addCategory);
router.post("/changeStatus", categoryController.changeStatus);
router.put("/updateCategory", categoryController.updateCategory);
router.delete("/deleteCategory/:id", categoryController.deleteCategory);
router.get("/getListCategoryInHome", categoryController.getListCategoryInHome);

module.exports = router;
