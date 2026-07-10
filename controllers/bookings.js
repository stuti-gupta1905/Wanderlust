const Listing = require("../models/listing");
const Booking = require("../models/booking");

module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut, guests } = req.body;
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkInDate >= checkOutDate) {
    req.flash("error", "Check-out date must be after check-in date.");
    return res.redirect(`/listings/${id}`);
  }

  const listing = await Listing.findById(id);

  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  const numberOfNights = Math.ceil(
    (checkOutDate - checkInDate) / millisecondsPerDay,
  );

  const totalPrice = listing.price * numberOfNights;

  const booking = new Booking({
    listing: listing._id,
    user: req.user._id,
    checkIn,
    checkOut,
    guests,
    totalPrice,
  });

  const conflictingBookings = await Booking.countDocuments({
    listing: id,
    checkIn: {
      $lt: checkOutDate,
    },
    checkOut: {
      $gt: checkInDate,
    },
    status: {
      $ne: "Cancelled",
    },
  });

  if (conflictingBookings >= 3) {
    req.flash(
      "error",
      "Sorry! This property is fully booked for the selected dates.",
    );

    return res.redirect(`/listings/${id}`);
  }

  await booking.save();

  listing.bookings.push(booking);

  await listing.save();

  req.flash(
    "success",
    "Booking request submitted successfully! Payment details will be shared on your registered email.",
  );

  res.redirect(`/listings/${id}`);
};

module.exports.myBookings = async (req, res) => {
  let bookings = await Booking.find({
    user: req.user._id,
  })
    .populate("listing")
    .sort({ createdAt: -1 });

  // Remove bookings whose listing no longer exists
  bookings = bookings.filter((booking) => booking.listing);

  res.render("bookings/mybookings", {
    bookings,
  });
};

module.exports.hostBookings = async (req, res) => {
  let bookings = await Booking.find()
    .populate({
      path: "listing",
      match: {
        owner: req.user._id,
      },
    })
    .populate("user")
    .sort({ createdAt: -1 });

  bookings = bookings.filter((booking) => booking.listing);

  res.render("bookings/guestbookings", {
    bookings,
  });
};

module.exports.cancelBooking = async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId)
    .populate("listing")
    .populate("user");

  if (!booking) {
    req.flash("error", "Booking not found.");
    return res.redirect("/bookings");
  }

  if (!booking.listing) {
    req.flash(
      "error",
      "The listing for this booking no longer exists."
    );
    return res.redirect("/bookings");
  }

  // Check whether current user is the guest or the host
  const isGuest = booking.user._id.equals(req.user._id);
  const isHost = booking.listing.owner.equals(req.user._id);

  if (!isGuest && !isHost) {
    req.flash(
      "error",
      "You are not authorized to cancel this booking."
    );
    return res.redirect("/bookings");
  }

  if (booking.status === "Cancelled") {
    req.flash(
      "error",
      "This booking has already been cancelled."
    );

    return res.redirect(
      isHost ? "/bookings/host" : "/bookings"
    );
  }

  booking.status = "Cancelled";
  await booking.save();

  req.flash(
    "success",
    "Booking cancelled successfully."
  );

  return res.redirect(
    isHost ? "/bookings/host" : "/bookings"
  );
};