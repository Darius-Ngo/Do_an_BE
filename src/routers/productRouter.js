const productController = require("../controllers/productController");

const router = require("express").Router();

router.get("/getListProduct", productController.getListProduct);
router.get("/getDetailProduct/:id", productController.getDetailProduct);
router.get(
  "/getProductByCategoryID/:id",
  productController.getProductByCategoryID
);
router.post("/addProduct", productController.addProduct);
router.put("/updateProduct", productController.updateProduct);
router.delete("/deleteProduct/:id", productController.deleteProduct);

module.exports = router;
