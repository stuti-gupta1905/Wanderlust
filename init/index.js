const path = require("path");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});
}

const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(() => {
    console.log("connection successful");
  })
  .catch((err) => {
    console.log(err);
  });

// const initDB = async () => {
//   await Listing.deleteMany({});
//   initdata.data = initdata.data.map((obj) => ({
//     ...obj,
//     owner: "6a4ba67efa4eb431f0c0d190",
//   }));
//   await Listing.insertMany(initdata.data);
//   console.log("Data was inititalized");
// };

// initDB();


const initDB = async () => {
  await Listing.deleteMany({});

  const updatedData = await Promise.all(
    initdata.data.map(async (obj) => {
      let response = await geocodingClient
        .forwardGeocode({
          query: obj.location,
          limit: 1,
        })
        .send();

      return {
        ...obj,
        owner: "6a4ba67efa4eb431f0c0d190",
        geometry: response.body.features[0].geometry,
      };
    })
  );

  await Listing.insertMany(updatedData);
  console.log("Data was initialized");
};

initDB();
