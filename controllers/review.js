const Listing = require("../models/listing.js");
const Review = require("../models/reviews.js");

module.exports.createReview = async (req, res) => {
  let lis = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;

  lis.reviews.push(newReview);

  await newReview.save();
  await lis.save();

  req.flash("success", "Review Added Succesfully!");

  res.redirect(`/listings/${lis._id}`);
};

module.exports.destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review Deleted Succesfully!");

  res.redirect(`/listings/${id}`);
};
