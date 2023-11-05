const postController = require("../controllers/postController");

const router = require("express").Router();

router.post("/getListPost", postController.getListPost);
router.get("/getDetailPost", postController.getDetailPost);
router.post("/addPost", postController.addPost);
router.put("/updatePost", postController.updatePost);
router.delete("/deletePost", postController.deletePost);
router.post("/changeStatus", postController.changeStatus);
router.post("/getListPostHome", postController.getListPostHome);
router.post("/getDetailPostHome", postController.getDetailPostHome);

module.exports = router;
