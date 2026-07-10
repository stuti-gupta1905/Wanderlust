const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const plugin = passportLocalMongoose.default || passportLocalMongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },

  image: {
    url: {
      type: String,
      default:
        "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    },
    filename: {
      type: String,
      default: "",
    },
  },

  bio: {
    type: String,
    default: "",
  },

  location: {
    type: String,
    default: "",
  },

  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.plugin(plugin);

module.exports = mongoose.model("User", userSchema);
