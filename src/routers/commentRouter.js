const commentController = require("../controllers/commentController");

const router = require("express").Router();

router.post("/getListComment", commentController.getListComment);
router.post("/addComment", commentController.addComment);
router.put("/updateComment", commentController.updateComment);
router.delete("/deleteComment", commentController.deleteComment);

module.exports = router;
