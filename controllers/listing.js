const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const { cloudinary } = require("../cloudConfig");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewform = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const lis = await Listing.findById(id)
    .populate({ path: "reviews", populate: "author" })
    .populate("owner");
  if (!lis) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { lis });
};

module.exports.createListing = async (req, res) => {
  // let {title,description,image,price,country,location}=req.body;
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = response.body.features[0].geometry;
  await newListing.save();
  req.flash("success", "New Listing Added Succesfully!");
  res.redirect("/listings");
};

module.exports.renderEditform = async (req, res) => {
  let { id } = req.params;
  const lis = await Listing.findById(id);
  if (!lis) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }
  let og = lis.image.url;
  og = og.replace("/upload", "/upload/h_300,w_250");
  res.render("listings/edit.ejs", { lis, og });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();
  let listing = await Listing.findById(id);
  Object.assign(listing, req.body.listing);
  listing.geometry = response.body.features[0].geometry;
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
  }
  await listing.save();
  req.flash("success", "Listing Updated Succesfully!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (listing.image?.filename) {
    await cloudinary.uploader.destroy(listing.image.filename);
  }
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted Succesfully!");
  res.redirect(`/listings`);
};

module.exports.searchListings = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    req.flash("error", "Please enter something to search.");
    return res.redirect("/listings");
  }

  const allListings = await Listing.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ],
  });

  if (allListings.length === 0) {
    req.flash("error", "No listings found.");
  }

  res.render("listings/index.ejs", { allListings });
};
