const orderController = require("../controllers/orderController");

const router = require("express").Router();

router.get("/getTotalStatus", orderController.getTotalStatus);
router.post("/updateStatus", orderController.updateStatus);
router.get("/getDetailUpdate", orderController.getDetailUpdate);

router.get("/getListOrderUser", orderController.getListOrderUser);
router.get("/getDetailOrder", orderController.getDetailOrder);
router.post("/addOrder", orderController.addOrder);

router.get("/getListOrderManager", orderController.getListOrderManager);

router.get("/getListAddressOrder", orderController.getListAddressOrder);
router.post("/addAddress", orderController.addAddress);
router.post("/updateAddress", orderController.updateAddress);
router.patch("/deleteAddress", orderController.deleteAddress);

module.exports = router;
