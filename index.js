const connection = require("./model");
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const userController = require("./controllers/userData.js");

const expressHandler = require("express-handlebars");
const bodyParser = require("body-parser");

const publicDirectoryPath = path.join(__dirname, "public");
console.log(publicDirectoryPath);
const viewPath = path.join(__dirname, "templates/views");
const partialsPath = path.join(__dirname, "templates/partials");

//setup handlebars
app.set("view engine", "hbs");
app.set("views", viewPath);
hbs.registerPartials(partialsPath);

//seting up static files. So that
//we don't have to give location
//of whole file present in public folder
app.use(express.static(publicDirectoryPath));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.get("/", (req, res) => {
  res.render("index", {
    title: "weather app 1",
    name: "himanshu aswal",
  });
});

app.use("/userData", userController);

app.listen("3000", () => {
  console.log("server started");
});
