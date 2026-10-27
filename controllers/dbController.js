const { body, validationResult, matchedData } = require("express-validator");
const bcrypt = require("bcryptjs");
const db = require("../db/queries");
const passport = require("../auth/authController");


async function openHome(req, res) {
  // if a user is logged in, then get all messages so they can be displayed
  if(req.user) {
    const messages = await db.getAllMessages();
    res.render("index", { user: req.user, messages: messages });
  }
  // otherwise, don't bother getting the messages
  else {
    res.render("index", { user: req.user });
  }
}


const validateSignup = [
  body("name").trim()
    .notEmpty().withMessage("Name should not be empty."),
  body("username").trim()
    .notEmpty().withMessage("Username should not be empty."),
  body("password").trim()
    .isLength({ min: 4 }).withMessage("Password should be at least 4 characters long."),
  body("confirm-password").trim()
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Confirm Password needs to match Password."),
];
async function submitSignup(req, res, next) {
  // check that all inputs are valid
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("sign-up-form", {
      errors: errors.array(),
    });
  }

  // confirm-password isn't being used outside of the initial validation
  const { name, username, password, confirmPassword } = matchedData(req);
  // add user to DB
  let postErrors = [];
  try {
    // encrypts input password by first adding a number of extra random chars to the end of the input (num in 2nd arg, this is known as "salting"), then hashes the result
    // console.log(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);
    postErrors = await db.createUser(name, username, hashedPassword);
  }
  // catches errors other than validation or username conflict (I think)
  catch (error) {
    console.error(error);
    next(error);
  }

  // check if any post errors (mainly if an entry with the same username already exists in the "users" DB)
  if(postErrors.length === 0) {
    res.redirect("/");
  }
  else {
    return res.status(409).render("sign-up-form", {
      errors: postErrors,
    });
  }

}


// passport.authenticate("local", ...) applys the LocalStrategy stored in passport
async function logIn(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).render("index", {
        errors: [{ msg: info?.message || "Login failed" }]
      });
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      return res.redirect('/');
    });
  })(req, res, next);
}


// logout() is a built-in function of passport
async function logOut(req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
}


async function updateMembership(req, res, next) {
  const username = res.locals.currentUser.username;
  const membershipCode = req.body.membership_code;
  const postErrors = await db.updateUserMembership(username, membershipCode);

  // check if any post errors (mainly if an entry with the same username already exists in the "users" DB)
  if(postErrors.length === 0) {
    res.redirect("/");
  }
  else {
    return res.status(404).render("membership-form", {
      errors: postErrors,
    });
  }
}


const validateMessage = [
  body("title").trim()
    .notEmpty().withMessage("Title should not be empty."),
  body("body").trim()
    .isLength({ min: 10 }).withMessage("Message body should be at least 10 characters long"),
];
async function submitMessage(req, res, next) {
  // check that all inputs are valid
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("message-form", {
      errors: errors.array(),
    });
  }

  const { title, body } = matchedData(req);
  const username = res.locals.currentUser.username;
  // add message to DB
  const postErrors = await db.createMessage(title, username, body);
  

  // check if any post errors (mainly if an entry with the same username already exists in the "users" DB)
  if(postErrors.length === 0) {
    res.redirect("/");
  }
  else {
    return res.status(409).render("message-form", {
      errors: postErrors,
    });
  }

}


module.exports = {
  openHome,
  validateSignup,
  submitSignup,
  logIn,
  logOut,
  updateMembership,
  validateMessage,
  submitMessage,
};
