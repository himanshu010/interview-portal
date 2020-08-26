const mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  username: {
    type: "string",
    required: "Required",
  },
  email: {
    type: "string",
    required: "Required",
  },
  schedule: {
    type: {},
  },
});

mongoose.model("userData", userSchema);
