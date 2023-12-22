const userController = require("../controllers/userController");

const router = require("express").Router();

router.post("/getListUser", userController.getListUser);
router.get("/getDetailUser/:id", userController.getDetailUser);
router.post("/addUser", userController.addUser);
router.post("/changeStatus", userController.changeStatus);
router.post("/resetPassword", userController.resetPassword);
router.put("/updateUser", userController.updateUser);
router.delete("/deleteUser/:id", userController.deleteUser);
router.post("/exportExcel", userController.exportExcel);

module.exports = router;
