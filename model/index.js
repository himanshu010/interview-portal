const mongoose = require("mongoose");

mongoose.connect(
  "mongodb://localhost:27017/portal",
  { useNewUrlParser: true, useUnifiedTopology: true },
  (error) => {
    if (error) {
      return console.log("Error in Connection");
    }
    console.log("Connection established");
  }
);

const userData = require("./model.js");
