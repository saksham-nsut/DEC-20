const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const methodOverride = require('method-override');

dotenv.config();
require("./middlewares/passport")(passport);

const app = express();
app.use(cors());
app.options("*", cors());
app.use(methodOverride('_method'));

const db = process.env.MONGO_URI;
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use(expressLayouts);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/public", express.static(path.join(__dirname, "public")));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user;
  next();
});

// Routes
app.use("/", require("./routes/index.js"));
app.use("/users", require("./routes/users.js"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on PORT http://localhost:${PORT}/`);
});
