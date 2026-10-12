// load .env variables if it exists
try {
  process.loadEnvFile();
} catch(error) {}

const path = require("node:path");
const { Pool } = require("pg");
const express = require("express");
const session = require("express-session");

const passport = require("./auth/authController");


const pool = new Pool({
  // add your configuration
  connectionString: process.env.LOCAL_DB_URL
});

// standard express app setup
const app = express();

// let code know we're using ejs as template engine as well as location of views folder
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// setup path to static assets
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

// middleware setup
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
// allows user to be stored as currentUser in locals, so you won’t have to manually pass it into all of the controllers in which you need it (just reference locals.currentUser)
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// import + use routers
const indexRouter = require("./routes/indexRouter");
app.use("/", indexRouter);



// open web server
const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`listening on port ${PORT}`);
});
