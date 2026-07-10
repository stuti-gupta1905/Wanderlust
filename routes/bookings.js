const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");

const bookingController = require("../controllers/bookings");

router.post(
  "/",
  isLoggedIn,
  wrapAsync(bookingController.createBooking)
);

module.exports = router;