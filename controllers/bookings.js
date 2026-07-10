const Listing = require("../models/listing");
const Booking = require("../models/booking");

module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut, guests } = req.body;

  const listing = await Listing.findById(id);

  // We'll calculate this dynamically later
  const totalPrice = listing.price;

  const booking = new Booking({
    listing: listing._id,
    user: req.user._id,
    checkIn,
    checkOut,
    guests,
    totalPrice,
  });

  await booking.save();

  listing.bookings.push(booking);

  await listing.save();

  req.flash(
    "success",
    "Booking request submitted successfully! Payment details will be shared on your registered email."
  );

  res.redirect(`/listings/${id}`);
};