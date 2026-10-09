// load .env variables if it exists
try {
  process.loadEnvFile();
} catch(error) {}

const path = require("node:path");
const { Pool } = require("pg");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcryptjs");

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

// import + use routers
const indexRouter = require("./routes/indexRouter");
app.use("/", indexRouter);



// middleware setup
app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
// allows user to be stored as currentUser in locals, so you won’t have to manually pass it into all of the controllers in which you need it (just reference locals.currentUser)
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});



// adds strategy to passport that searches for username in DB, and checks if the input password is correct
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
      const user = rows[0];

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      // signin password is compared with the hashed DB password (I assume it internally unhashes the DB password + removes salt, then compares)
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        // passwords do not match!
        return done(null, false, { message: "Incorrect password" })
      }
      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);

// stores data in current session data (user login)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// retrieves data from current session data (user login)
passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = rows[0];

    done(null, user);
  } catch(err) {
    done(err);
  }
});



// open web server
const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`listening on port ${PORT}`);
});
