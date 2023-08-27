const categoryController = require("../controllers/categoryController");

const router = require("express").Router();

router.get("/getListCategory", categoryController.getListCategory);
router.get("/getDetailCategory/:id", categoryController.getDetailCategory);
router.post("/addCategory", categoryController.addCategory);
router.put("/updateCategory", categoryController.updateCategory);
router.delete("/deleteCategory/:id", categoryController.deleteCategory);

module.exports = router;
