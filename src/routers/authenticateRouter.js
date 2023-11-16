const authenticateController = require("../controllers/authenticateController");

const router = require("express").Router();

router.post("/register", authenticateController.register);
router.post("/login", authenticateController.login);
router.post("/logout", authenticateController.logout);
router.post("/changePassWord", authenticateController.changePassWord);
router.post("/forgetPassWord", authenticateController.forgetPassWord);
router.post("/confirmOTP", authenticateController.confirmOTP);

module.exports = router;
