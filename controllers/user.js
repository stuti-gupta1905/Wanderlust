const Listing = require("../models/listing.js");
const Review = require("../models/reviews.js");
const User = require("../models/user.js");
const { cloudinary } = require("../cloudConfig");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to Wanderlust");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged out, see you again!");
    res.redirect("/listings");
  });
};

module.exports.showProfile = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    req.flash("error", "User not found!");
    return res.redirect("/listings");
  }

  const listings = await Listing.find({ owner: id });

  res.render("users/show.ejs", { user, listings });
};

module.exports.renderEditProfile = (req, res) => {
  res.render("users/edit.ejs");
};

module.exports.updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  user.bio = req.body.user.bio;
  user.location = req.body.user.location;

  if (req.file) {
    user.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await user.save();

  req.flash("success", "Profile updated successfully!");

  res.redirect(`/users/${user._id}`);
};

module.exports.deleteUser = async (req, res, next) => {
  const userId = req.user._id;
  const listings = await Listing.find({ owner: userId });

  for (let listing of listings) {
    if (listing.image && listing.image.filename) {
      await cloudinary.uploader.destroy(listing.image.filename);
    }
  }
  const user = await User.findById(userId);

  if (user.image?.filename) {
    await cloudinary.uploader.destroy(user.image.filename);
  }

  for (const listing of listings) {
    await Listing.findByIdAndDelete(listing._id);
  }
  await Review.deleteMany({ author: userId });
  await User.findByIdAndDelete(userId);
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Account deleted successfully.");
    res.redirect("/listings");
  });
};
