const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcryptjs");
const db = require("../db/queries");

// adds strategy to passport that searches for username in DB, and checks if the input password is correct
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await db.getUser(username);

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
  done(null, user.username);
});

// retrieves data from current session data (user login)
passport.deserializeUser(async (username, done) => {
  try {
    const user = await db.getUser(username);

    done(null, user);
  } catch(err) {
    done(err);
  }
});


module.exports = passport;
