const cartController = require("../controllers/cartController");

const router = require("express").Router();

router.get("/getListCart", cartController.getListCart);
router.post("/addToCart", cartController.addToCart);
router.post("/deleteCart", cartController.deleteCart);

module.exports = router;
