const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");

const bookingController = require("../controllers/bookings");

router.post(
  "/:id",
  isLoggedIn,
  wrapAsync(bookingController.createBooking)
);

router.get(
  "/",
  isLoggedIn,
  wrapAsync(bookingController.myBookings)
);

router.get(
  "/host",
  isLoggedIn,
  wrapAsync(bookingController.hostBookings)
);

router.put(
  "/:bookingId/cancel",
  isLoggedIn,
  wrapAsync(bookingController.cancelBooking)
);

module.exports = router;