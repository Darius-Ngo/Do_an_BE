const productController = require("../controllers/productController");

const router = require("express").Router();

router.post("/getListProduct", productController.getListProduct);
router.get("/getDetailProduct/:id", productController.getDetailProduct);
router.post(
  "/getProductByCategoryID/:id",
  productController.getProductByCategoryID
);
router.post("/addProduct", productController.addProduct);
router.post("/changeStatus", productController.changeStatus);
router.put("/updateProduct", productController.updateProduct);
router.delete("/deleteProduct/:id", productController.deleteProduct);

module.exports = router;
