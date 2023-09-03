const authenticateController = require("../controllers/authenticateController");

const router = require("express").Router();

router.post("/register", authenticateController.register);
router.post("/login", authenticateController.login);
router.post("/logout", authenticateController.logout);

module.exports = router;
