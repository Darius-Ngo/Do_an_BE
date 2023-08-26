const userController = require("../controllers/userController");

const router = require("express").Router();

//GET ALL USER
router.get("/getListUser", userController.getListUser);
router.get("/getDetailUser/:id", userController.getDetailUser);
router.post("/addUser", userController.addUser);
router.put("/updateUser", userController.updateUser);
router.delete("/deleteUser/:id", userController.deleteUser);

module.exports = router;
