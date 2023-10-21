const cartController = require("../controllers/cartController");

const router = require("express").Router();

router.get("/getListCart", cartController.getListCart);
router.get("/checkProductCart", cartController.checkProductCart);
router.post("/addToCart", cartController.addToCart);
router.post("/deleteCart", cartController.deleteCart);

module.exports = router;
