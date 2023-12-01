const authenticateController = require("../controllers/authenticateController");

const router = require("express").Router();
const passport = require("passport");

router.post("/register", authenticateController.register);
router.post("/login", authenticateController.login);
router.post("/logout", authenticateController.logout);
router.post("/changePassWord", authenticateController.changePassWord);
router.post("/forgetPassWord", authenticateController.forgetPassWord);
router.post("/confirmOTP", authenticateController.confirmOTP);
//login facebook
router.get("/loginFacebook", authenticateController.loginFacebook);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
);
router.get("/checkLogin", authenticateController.checkLogin);

module.exports = router;
