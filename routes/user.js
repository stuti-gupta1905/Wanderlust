const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirecturl } = require("../middleware.js");
const { isLoggedIn } = require("../middleware");
const { storage } = require("../cloudConfig");
const multer = require("multer");
const upload = multer({ storage });

const userController=require("../controllers/user.js");

// SIGNUP
router.get("/signup", userController.renderSignupForm);

router.post(
  "/signup",
  wrapAsync(userController.signup),
);

// LOGIN
router.get("/login", userController.renderLoginForm);

router.post(
  "/login",
  saveRedirecturl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  wrapAsync(userController.login),
);

// LOGOUT
router.get("/logout", userController.logout);

// Profile
router.get("/users/edit", isLoggedIn, userController.renderEditProfile);

router.put(
  "/users/edit",
  isLoggedIn,
  upload.single("user[image]"),
  wrapAsync(userController.updateProfile)
);
router.get("/:id", wrapAsync(userController.showProfile));

router.delete(
  "/users/delete",
  isLoggedIn,
  wrapAsync(userController.deleteUser)
);

module.exports = router;
