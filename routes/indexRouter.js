const { Router } = require("express");
const router = Router();
const dbController = require("../controllers/dbController");


// NOTE TO SELF: ordering here matters, put /:A/B before /:A/:C, otherwise all pages that should be /:A/B will instead be assumed as /:A/:C

router.get("/", (req, res) => res.render("index", { user: req.user }));

router.get("/sign-up", (req, res) => res.render("sign-up-form"));
router.post("/sign-up", dbController.validateSignup, dbController.submitSignup);

router.post("/log-in", dbController.logIn);

router.get("/log-out", dbController.logOut);

router.get("/membership-form", (req, res) => res.render("membership-form"));
router.post("/membership-form", dbController.updateMembership);


module.exports = router;
